import { nanoid } from "nanoid";
import { cloudinary } from "../../../Config/cloudinary.config.js";
import { commentOnModelEnum } from "../../../Constants/constants.js";
import { Post } from "../../../DB/models/post.model.js";
import { User } from "../../../DB/models/user.model.js";
import { Comment } from "../../../DB/models/comment.model.js";

export const addCommentService = async (req, res) => {
    const { _id:ownerId } = req.loggedInUser;
    const { content , tags, onModel } = req.body;
    const { commentOnId } = req.params;

    const commentObject = {
        content,
        ownerId,
        tags
    }

    /* check is tags includes valid userId this time using middleware */
    // if(tags.length > 0){
    //     const users = await User.find({_id:{$in:tags}});
    //     if(users.length !== tags.length){
    //         return res.status(400).json({
    //             message: "Invalid tags"
    //         })
    //     }
    //     commentObject.tags = tags;
    // }

    if(onModel == commentOnModelEnum.POST){
        /* use findOne as there is two conditions */
        const post = await Post.findOne({_id:commentOnId, allowedComments:true});
        if(!post){
            return res.status(400).json({
                message: "Post not found"
            })
        }
    }
    else if(onModel == commentOnModelEnum.COMMENT){
        /* use findById as there is only one condition */
        const comment = await Comment.findById(commentOnId);
        if(!comment){
            return res.status(400).json({
                message: "Comment not found"
            })
        }        
    }

    commentObject.commentOnId = commentOnId;
    commentObject.onModel = onModel;



    /* check if there is images */
    if(req.files.length > 0){
        const folderId = nanoid(4);
        let images = {
            URLS:[],
            folderId,
        }
        for(const file of req.files){
            const {secure_url, public_id} = await cloudinary().uploader.upload(file.path,{
                folder:`${process.env.CLOUDINARY_FOLDER}/Post/${folderId}`,
            })
            images.URLS.push({secure_url, public_id});
        }
        commentObject.images = images;
    }

    const comment = await Comment.create(commentObject);
    res.status(201).json({
        message: "Comment created successfully"
    })
}

export const getAllCommentsService = async (req, res) => {
    const comments = await Comment.find().populate([
        {
            path: "commentOnId",
            select:"content -_id",
            populate:[{
                // user who made the comment that was replied on
                path: "ownerId",
                select:"username -_id"
            }]
        },
        {
            // user who made the reply
            path: "ownerId",
            select:"username -_id"
        }
    ])
    // .select("content commentOnId onModel -_id");
    if(!comments){
        return res.status(404).json({
            message: "Comments not found"
        })
    }
    res.status(200).json({
        message: "Comments found",
        comments
    })
}