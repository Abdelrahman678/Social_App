import { commentOnModelEnum, reactTypeEnum } from "../../../Constants/constants.js";
import { Comment } from "../../../DB/models/comment.model.js";
import { Post } from "../../../DB/models/post.model.js";
import { React } from "../../../DB/models/react.model.js";

export const addReactService = async (req, res) => {
    const { _id:ownerId } = req.loggedInUser;
    const { reactType, onModel } = req.body;
    const { reactOnId } = req.params;

    if(onModel == commentOnModelEnum.POST){
        const post = await Post.findById(reactOnId);
        if(!post){
            return res.status(400).json({
                message: "Post not found"
            })
        }
    }
    else if(onModel == commentOnModelEnum.COMMENT){
        const comment = await Comment.findById(reactOnId);
        if(!comment){
            return res.status(400).json({
                message: "Comment not found"
            })
        }        
    }

    const reacts = Object.values(reactTypeEnum)
    if(!reacts.includes(reactType)){
        return res.status(400).json({
            message: "Invalid react type"
        })
    }

    const react = await React.create({
        reactOnId,
        onModel,
        ownerId,
        reactType
    })
    return res.status(201).json({
        message: "React created successfully",
        react
    })
    
}

export const deleteReactService = async (req, res) => {
    const { _id:ownerId } = req.loggedInUser;
    const { reactId } = req.params;
    const deleteReact = await React.findOneAndDelete({
        _id:reactId,
        ownerId
    })
    // console.log(req.method);
    if(!deleteReact){
        return res.status(404).json({
            message: "React not found"
        })
    }
    return res.status(200).json({
        message: "React deleted successfully",
        deleteReact
    })
}