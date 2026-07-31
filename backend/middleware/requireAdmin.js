function requireAdmin(req, res, next) {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({error: 'Not authorized to perform this operation'});
    }

    next();
}

module.exports = requireAdmin;