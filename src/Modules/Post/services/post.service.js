import { nanoid } from "nanoid";
import { Post } from "../../../DB/models/post.model.js";
import { User } from "../../../DB/models/user.model.js";
import { cloudinary } from "../../../Config/cloudinary.config.js";
import { pagination } from "../../../utils/pagination.utils.js";
/** 
 * Name => js docs
 * create post
 * @api /post/create
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Response>}
 * @description create post for user
 */



export const createPostService = async (req, res) => {
    const {_id:ownerId} = req.loggedInUser;
    const {title, description, allowedComments} = req.body;
    let {tags} = req.body;

    const postObject = {
        title,
        description,
        ownerId,
        allowedComments
    };

    /* check is tags includes valid userId */
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
        postObject.images = images;
    }

    const post = await Post.create(postObject);
    res.status(201).json({
        message: "Post created successfully"
    })
}

export const getAllPostsService = async (req, res) => {
    const {page, limit} = req.query;
    // const {skip, limit:calculatedLimit} = pagination(page, limit);

    /* normal pagination */
    /* count the number of posts that allowed comments is true */
    // const allPosts = await Post.countDocuments({allowedComments:true});
    // const posts = await Post.find({})
    // .sort({createdAt:-1})
    // .limit(calculatedLimit)
    // .skip(skip)  
    // .populate(
    //     [
    //         {
    //           path: "Comments", 
    //           populate: {
    //             path:"Comments",
    //             model: "Comment"
    //           } 
    //         }
    //     ]
    // )  

    /* paginate using the plugin */
    const posts = await Post.paginate(
        {allowedComments:true},
        {
            limit:limit,
            page:page,
            sort:{
                createdAt:-1
            },
            populate:[
                {
                    path: "ownerId",
                    select:"username -_id"
                }
            ],
            customLabels:{
                totalDocs:"totalPosts",
                docs:"posts"
            }
        }
    )
    if(!posts){
        return res.status(404).json({
            message: "Posts not found"
        })
    }
    res.status(200).json({
        message: "Posts found",
        posts,
        // totalPosts:allPosts
    }) 
}  