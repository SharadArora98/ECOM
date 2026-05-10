
const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user found" });
        }
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
        }
        next();
    };
};

export default roleMiddleware;