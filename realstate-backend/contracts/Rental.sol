// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Rental {
    uint256 public agreementCount;

    enum Status { Active, Terminated, Completed }

    struct RentalAgreement {
        uint256 id;
        address payable landlord;
        address payable tenant;
        uint256 propertyId;
        uint256 monthlyRent; // in wei
        uint256 depositAmount; // in wei (held in escrow)
        uint256 startTimestamp;
        uint256 durationMonths;
        uint256 paidMonths; // months already paid after upfront
        Status status;
    }

    // agreementId => RentalAgreement
    mapping(uint256 => RentalAgreement) public agreements;
    // propertyId => activeAgreementId
    mapping(uint256 => uint256) public activeByProperty;

    // escrow balances held per agreement
    mapping(uint256 => uint256) public escrowBalances;

    event RentalCreated(uint256 indexed agreementId, uint256 indexed propertyId, address landlord, address tenant, uint256 monthlyRent, uint256 deposit);
    event RentPaid(uint256 indexed agreementId, address payer, uint256 months, uint256 amount);
    event RentalTerminated(uint256 indexed agreementId, address by, string reason);
    event DepositReturned(uint256 indexed agreementId, address tenant, uint256 amount);
    event DepositClaimed(uint256 indexed agreementId, address landlord, uint256 amount);

    // Create a rental agreement record when landlord approves or property is rented.
    // This is expected to be called by a trusted marketplace or by the landlord.
    function createAgreement(uint256 _propertyId, address payable _tenant, uint256 _monthlyRent, uint256 _durationMonths) external returns (uint256) {
        require(_tenant != address(0), "tenant required");
        require(_monthlyRent > 0, "monthly rent required");
        require(_durationMonths > 0, "duration required");

        agreementCount++;
        agreements[agreementCount] = RentalAgreement({
            id: agreementCount,
            landlord: payable(msg.sender),
            tenant: _tenant,
            propertyId: _propertyId,
            monthlyRent: _monthlyRent,
            depositAmount: 0,
            startTimestamp: 0,
            durationMonths: _durationMonths,
            paidMonths: 0,
            status: Status.Active
        });

        activeByProperty[_propertyId] = agreementCount;

        emit RentalCreated(agreementCount, _propertyId, msg.sender, _tenant, _monthlyRent, 0);
        return agreementCount;
    }

    // Tenant calls this and sends first month + deposit (deposit == monthlyRent)
    function acceptAndFund(uint256 _agreementId) external payable {
        RentalAgreement storage a = agreements[_agreementId];
        require(a.status == Status.Active, "agreement not active");
        require(a.tenant == msg.sender, "only tenant can fund agreement");
        require(a.startTimestamp == 0, "already funded");

        uint256 required = a.monthlyRent + a.monthlyRent; // first month + deposit (1x month)
        require(msg.value >= required, "insufficient upfront funds");

        // pay first month instantly to landlord
        a.landlord.transfer(a.monthlyRent);

        // hold deposit in escrow
        escrowBalances[_agreementId] = a.monthlyRent;
        a.depositAmount = a.monthlyRent;

        a.startTimestamp = block.timestamp;
        a.paidMonths = 1; // first month covered

        emit RentPaid(_agreementId, msg.sender, 1, a.monthlyRent);
        emit RentalCreated(_agreementId, a.propertyId, a.landlord, a.tenant, a.monthlyRent, a.depositAmount);

        // refund any excess
        if (msg.value > required) {
            payable(msg.sender).transfer(msg.value - required);
        }
    }

    // Tenant pays subsequent months in advance (1..n months). Cannot pay beyond contract end.
    function payRent(uint256 _agreementId, uint256 _months) external payable {
        RentalAgreement storage a = agreements[_agreementId];
        require(a.status == Status.Active, "agreement not active");
        require(a.startTimestamp > 0, "agreement not started");
        require(a.tenant == msg.sender, "only tenant can pay");
        require(_months > 0, "months required");

        uint256 maxRemaining = a.durationMonths - a.paidMonths;
        require(_months <= maxRemaining, "cannot pay beyond end date");

        uint256 amountDue = a.monthlyRent * _months;

        // Late fee logic: simple approach — caller should include penalties if applicable
        require(msg.value >= amountDue, "insufficient payment");

        // transfer rent to landlord
        a.landlord.transfer(amountDue);
        a.paidMonths += _months;

        emit RentPaid(_agreementId, msg.sender, _months, amountDue);

        // refund excess
        if (msg.value > amountDue) {
            payable(msg.sender).transfer(msg.value - amountDue);
        }
    }

    // View helper: agreement end timestamp
    function agreementEnd(uint256 _agreementId) public view returns (uint256) {
        RentalAgreement storage a = agreements[_agreementId];
        if (a.startTimestamp == 0) return 0;
        return a.startTimestamp + (a.durationMonths * 30 days);
    }

    // Tenant terminates early. If inside last 10% of remaining contract duration, refund deposit; otherwise landlord keeps deposit.
    function terminateByTenant(uint256 _agreementId) external {
        RentalAgreement storage a = agreements[_agreementId];
        require(a.status == Status.Active, "not active");
        require(a.tenant == msg.sender, "only tenant");
        require(a.startTimestamp > 0, "not started");

        uint256 endTs = agreementEnd(_agreementId);
        uint256 totalDuration = endTs - a.startTimestamp;
        uint256 timeLeft = 0;
        if (block.timestamp < endTs) {
            timeLeft = endTs - block.timestamp;
        }

        // last10Percent window
        bool inLast10 = (timeLeft * 10) <= totalDuration;

        a.status = Status.Terminated;
        activeByProperty[a.propertyId] = 0;

        if (inLast10) {
            uint256 deposit = escrowBalances[_agreementId];
            escrowBalances[_agreementId] = 0;
            if (deposit > 0) {
                payable(a.tenant).transfer(deposit);
                emit DepositReturned(_agreementId, a.tenant, deposit);
            }
        } else {
            uint256 deposit = escrowBalances[_agreementId];
            escrowBalances[_agreementId] = 0;
            if (deposit > 0) {
                payable(a.landlord).transfer(deposit);
                emit DepositClaimed(_agreementId, a.landlord, deposit);
            }
        }

        emit RentalTerminated(_agreementId, msg.sender, inLast10 ? "TenantEarly_Last10Pct_ReturnDeposit" : "TenantEarly_DepositKept");
    }

    // Landlord terminates due to default (after day 15+ past a missed payment). Keeps deposit.
    function terminateByLandlordForDefault(uint256 _agreementId) external {
        RentalAgreement storage a = agreements[_agreementId];
        require(a.status == Status.Active, "not active");
        require(a.landlord == msg.sender, "only landlord");
        require(a.startTimestamp > 0, "not started");

        // Basic rule: allow landlord to call if more than 15 days after next unpaid due date.
        // For simplicity we don't compute exact due date here; off-chain should verify conditions before calling.

        a.status = Status.Terminated;
        activeByProperty[a.propertyId] = 0;

        uint256 deposit = escrowBalances[_agreementId];
        escrowBalances[_agreementId] = 0;
        if (deposit > 0) {
            payable(a.landlord).transfer(deposit);
            emit DepositClaimed(_agreementId, a.landlord, deposit);
        }

        emit RentalTerminated(_agreementId, msg.sender, "LandlordDefault_KeptDeposit");
    }

    // On natural completion: anyone can call to settle and refund deposit to tenant
    function settleCompletion(uint256 _agreementId) external {
        RentalAgreement storage a = agreements[_agreementId];
        require(a.status == Status.Active, "not active");
        require(a.startTimestamp > 0, "not started");
        require(block.timestamp >= agreementEnd(_agreementId), "contract not ended yet");

        a.status = Status.Completed;
        activeByProperty[a.propertyId] = 0;

        uint256 deposit = escrowBalances[_agreementId];
        escrowBalances[_agreementId] = 0;
        if (deposit > 0) {
            payable(a.tenant).transfer(deposit);
            emit DepositReturned(_agreementId, a.tenant, deposit);
        }

        emit RentalTerminated(_agreementId, msg.sender, "NaturalCompletion_DepositReturned");
    }

    // Helper getters
    function getAgreement(uint256 _agreementId) external view returns (RentalAgreement memory) {
        return agreements[_agreementId];
    }
}
