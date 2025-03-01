import { User } from "../DB/models/user.model.js";

export const checkTagMentionExistsMiddleware = async (req, res, next) => {
    let {tags} = req.body;

    if (tags && !Array.isArray(tags)) {
        tags = [tags];
    }
    if (tags && tags.length) {
        const users = await User.find({ _id: { $in: tags } });
        if (users.length !== tags.length) {
            return res.status(400).json({
                message: "Invalid tags"
            });
        }
        postObject.tags = tags;
    }
     
    next();
}
