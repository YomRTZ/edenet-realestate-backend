// PropertyView feature removed; lightweight placeholders respond 410 Gone

const featureRemoved = (req, res) => {
  res.status(410).json({ success: false, message: 'PropertyView feature removed' });
};

export const createPropertyView = featureRemoved;
export const getPropertyViews = featureRemoved;
export const getUserViews = featureRemoved;
