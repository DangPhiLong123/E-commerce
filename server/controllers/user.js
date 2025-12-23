const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const {generateAccessToken, generateRefreshToken} = require('../middleware/jwt');
const jwt = require('jsonwebtoken');
const sendMail = require('../ultils/sendMail');
const crypto = require('crypto');
const makeToken = require('uniqid')
const {users} = require('../ultils/constant')

// const register = asyncHandler(async(req , res) => {
//         const {email, password, firstname, lastname} = req.body
//         if (!email || !password || !firstname || !lastname) 
//         return res.status(400).json({
//             success: false,
//             mes: 'Missing inputs'
//         })

//         const user = await User.findOne({email})
//         if(user) 
//             throw new Error('User has existed!')
//         else {
//             const newUser = await User.create(req.body)
//             return res.status(200).json({
//                 success: newUser ? true : false,
//                 mes: newUser ? 'Register is successfuly. Please go login ' : 'Something went wrong'
//             })
//     }
        
// })
const register = asyncHandler(async(req, res) => {
    const { email, password, firstname, lastname, mobile } = req.body
    if (!email || !password || !firstname || !lastname ||!mobile) 
        return res.status(400).json({
            success: false,
            mes: 'Missing inputs'
        })
        const user = await User.findOne({email})
        if(user) 
            throw new Error('User has existed!')
        else {
            const token = makeToken()
            res.cookie('dataregister',{...req.body,token}, {httpOnly: true, maxAge: 5*60*1000})
            const html = `Xin vui lòng click vào link dưới đây để hoàn tất quá trình đăng kí của bạn.Link này sẽ hết hạn sau 15 phút.
            <a href="${process.env.URL_SERVER}/api/user/finalregister/${token}"> Click here </a>`  
            await sendMail({email, html, subject: 'Hoàn tất đăng kí tài khoản Digital Xpress'})
            return res.json({
                success: true,
                mes: "Please check your email to active account"
            })
    }
})
const finalregister = asyncHandler(async(req, res) => {
    const cookie = req.cookies
    const {token} = req.params
    if (!cookie || cookie?.dataregister?.token !== token ) {
        res.clearCookie('dataregister')
        return res.redirect(`${process.env.CLIENT_URL}/finalregister/failsed`)
    }
    const newUser = await User.create({
        email: cookie?.dataregister?.email, 
        password: cookie?.dataregister?.password, 
        mobile: cookie?.dataregister?.mobile, 
        firstname: cookie?.dataregister?.firstname, 
        lastname: cookie?.dataregister?.lastname, 
        
    })
    res.clearCookie('dataregister')
    if (newUser) return res.redirect(`${process.env.CLIENT_URL}/finalregister/success`)
    else return res.redirect(`${process.env.CLIENT_URL}/finalregister/failsed`)
})
//refreshtoken => cấp mới accesstoken
//accesstoken => xác thực người dùng, phân quyền
const login = asyncHandler(async(req , res) => {
    const {email, password} = req.body
    if (!email || !password) 
    return res.status(400).json({
        success: false,
        mes: 'Missing inputs'
    })

    const response = await User.findOne({email})
    if (response && await response.isCorrectPassword(password)) {
        //Tách password và role ra khỏi responseresponse
        const {password, role, refreshToken, ...userData} = response.toObject()
        const accessToken = generateAccessToken(response._id, role)
        const newRefreshToken = generateRefreshToken(response._id)
        //Lưu refreshToken vào dbdb
        await User.findByIdAndUpdate(response._id, {refreshToken: newRefreshToken}, {new:true})
        //Lưu refreshToken vào cookie
        res.cookie('refreshToken', newRefreshToken, {httpOnly: true, maxAge: 7*24*60*60*1000})
        return res.status(200).json({
            success: true,
            accessToken,
            userData
        })
    }
    else {
        throw new Error('Invalid credentials!')
    }
})



const getCurrent = asyncHandler(async(req , res) => {
    const {_id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password').populate({
        path: 'cart',
        populate: {
            path: 'product',
            select: 'title thumb priceVariants colorVariants price'
        }
    })
    return res.status(200).json({
        success: user ? true : false,
        rs: user ? user : 'User not found'
    
    })

})

const refreshAccessToken = asyncHandler(async(req , res) => {
    //Lấy token từ cookies
    const cookie = req.cookies
    // Check xem có token không 
    if (!cookie && !cookie.refreshToken)  
        throw new Error('No Refresh token in cookies') 
    //Check token có hợp lệ không
    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({_id: rs._id, refreshToken: cookie.refreshToken})
        return res.status(200).json({
            success: response ? true : false,
            newAccessToken: response ? generateAccessToken(response._id, response.role) : 'Refresh Token not matching'
        })
        
    

   
})


const logout = asyncHandler(async(req , res) => {
    const cookie = req.cookies
    if (!cookie || !cookie.refreshToken) 
        throw new Error('No Refresh token in cookies') 
    //Xóa refreshtoken ở db
    await User.findOneAndUpdate({refreshToken: cookie.refreshToken}, {refreshToken: ''}, {new: true})
    //xóa refresh token ở cookie 
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    return res.status(200).json({
        success: true,
        mes: 'Logout is done'
    })

})

//Client gửi mail
// Server check mail có hợp lệ không => gửi mail + kèm theo link ( pass change token)
// Client check mail => click link
// Client gửi api kèm token
// Check token có giống vơi với token mà server gửi mail k
// Change password

const forgotPassword = asyncHandler(async(req , res) => {
    const {email} = req.body
    if (!email) 
        throw new Error('Missing email')
    const user = await User.findOne({email})
        if (!user) 
            throw new Error('User not found')
        //
        const resetToken = user.createPasswordChangedToken()
        await user.save()
        const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15 phút.
        <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}"> Click here </a>`
        const data = {
            email,
            html,
            subject: 'Forgot password'
        }
        const rs = await sendMail(data)
        return res.status(200).json ({
            success: rs.response?.includes('OK') ? true : false,
            mes: rs.response?.includes('OK') ? 'Please check your email' : 'Something went wrong'
        }) 
})
const resetPassword = asyncHandler(async (req, res) => {
    const {password, token} = req.body
    console.log({password, token});
    if (!password || !token) 
        throw new Error('Missing inputs!')
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({passwordResetToken, passwordResetExpires: {$gt:Date.now()}})
    if (!user )
        throw new Error('Invalid reset token')
    user.password = password
    user.passwordResetToken = undefined
    user.passwordChangeAt = Date.now()
    user.passwordResetExpires = undefined
    await user.save()
    return res.status(200).json ({
        success: user ? true: false,
        mes: user? 'Update password': 'Something went wrong'
    })

})

const getUsers = asyncHandler( async (req, res) => {
    const queries = { ...req.query };
    //
    const excludeFields = ["limit", "sort", "page", "fields"];
    excludeFields.forEach((el) => delete queries[el]);
    
    //
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, (matchedEl) => `$${matchedEl}`);
    const restQueries = JSON.parse(queryString);
    
    // Filtering
    if (queries?.name) restQueries.name = { $regex: queries.name, $options: "i" };
    if(req.query.q) {
        delete restQueries.q
        restQueries['$or'] = [
                {firstname : { $regex: req.query.q, $options: "i" }  },
                {lastname : { $regex: req.query.q, $options: "i" }  },
                {email : { $regex: req.query.q, $options: "i" }  },  
        ]
    }
    
    let queryCommand = User.find(restQueries)
  
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      queryCommand = queryCommand.sort(sortBy);
    }
  
    // Fields limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      queryCommand = queryCommand.select(fields);
    }

    //
  
    // Pagination
    const page = +req.query.page || 1;
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit;
    queryCommand.skip(skip).limit(limit);
  
    // Execute query
    try {
      const response = await queryCommand.exec();
      const counts = await User.find(restQueries).countDocuments();
      return res.status(200).json({
        success: response ? true : false,
        counts,
        users: response ? response : "Cannot get users",
      });
    } catch (err) {
      throw new Error(err.message);
    }
  })

const deleteUser = asyncHandler( async (req, res) => {
    const {_id} = req.query
    if (!_id) 
        throw new Error('Missing inputs')
    const response = await User.findByIdAndDelete(_id)
    return res.status(200).json ({
        success: response ? true: false,
        deletedUsers: response ? `User with email ${response.email} deleted` : 'No user delete'
    })
})

const updateUser = asyncHandler( async (req, res) => {
    const {_id} = req.user
    const {firstname, lastname, email, mobile} = req.body
    const data = {firstname, lastname, email, mobile}
    if (req.file) data.avatar = req.file.path
    if (!_id || Object.keys(req.body).length === 0) 
        throw new Error('Missing inputs')
    const response = await User.findByIdAndUpdate(_id, data, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json ({
        success: response ? true: false,
        message: response ? 'Update user successfully' : 'Something went wrong'
    })
})

const updateUserByAdmin = asyncHandler( async (req, res) => {
    const {uid} = req.params
    if (Object.keys(req.body).length === 0) 
        throw new Error('Missing inputs')
    const response = await User.findByIdAndUpdate(uid, req.body, {new: true}).select('-password -role -refreshToken')
    return res.status(200).json ({
        success: response ? true: false,
        updatedUsers: response ? response : 'Something went wrong'
    })
})

const updateAddressUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const newAddress = req.body.address;

    if (!newAddress) {
        throw new Error('Missing inputs');
    }

    // Tìm người dùng hiện tại
    const user = await User.findById(_id).select('address');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Kiểm tra xem địa chỉ mới đã tồn tại trong danh sách hay chưa
    const addressExists = user.address.some(address => address === newAddress);

    if (addressExists) {
        return res.status(400).json({
            success: false,
            message: 'Address already exists'
        });
    }

    // Thêm địa chỉ mới vào danh sách
    user.address.push(newAddress);
    const updatedUser = await user.save();

    // Loại bỏ các trường không cần thiết
    const response = updatedUser.toObject();
    delete response.password;
    delete response.role;
    delete response.refreshToken;

    return res.status(200).json({
        success: true,
        updatedUser: response
    });
});


const updateCart = asyncHandler( async (req, res) => {
    const {_id} = req.user
    const {pid, quantity = 1, color} = req.body
    if (!pid || !quantity || !color) 
        throw new Error ('Missing inputs')
    const user = await User.findById(_id).select('cart')
    const alreadyProduct = user?.cart?.find(el => el.product.toString() === pid)
    if (alreadyProduct) {
        if (alreadyProduct.color === color) {
            const response = await User.updateOne({cart: {$elemMatch: alreadyProduct}}, {$set: {"cart.$.quantity": quantity, "cart.$.color": color}}, {new: true})
            return res.status(200).json ({
                success: response ? true: false,
                mes: response ? 'Update cart successfully' : 'Something went wrong'
            })
        }
    } else {
        const response = await User.findByIdAndUpdate(_id, {$push: {cart: {product: pid, quantity, color}}}, {new: true})
        return res.status(200).json ({
            success: response ? true: false,
            mes: response ? 'Update to cart successfully' : 'Something went wrong'
            })
    }    
})

const removeProductInCart = asyncHandler( async (req, res) => {
    const {_id} = req.user
    const {pid } = req.params
    const user = await User.findById(_id).select('cart')
    const alreadyProduct = user?.cart?.find(el => el.product.toString() === pid)
    if (alreadyProduct) 
        return res.status(200).json ({
            success: true,
            message: 'Remove product from cart successfully'
        })
        const response = await User.findByIdAndUpdate(_id, {$pull: {cart: {product: pid}}}, {new: true})
        return res.status(200).json ({
            success: response ? true: false,
            mes: response ? 'Update to cart successfully' : 'Something went wrong'
            })
    
          
})

const getUserById = asyncHandler(async(req, res) => {
    const { id } = req.params
    const user = await User.findById(id).select('-refreshToken -password -role')
    return res.status(200).json({
        success: user ? true : false,
        rs: user ? user : 'User not found'
    })
})

const createUsers = asyncHandler(async(req, res) => {
    const response = await User.create(users)
    return res.status(200).json ({
        success: response ? true: false,
        users: response ? response : 'Something went wrong'
    })
})

module.exports = {
    register,
    finalregister,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getUsers,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    updateAddressUser,
    updateCart,
    getUserById,
    createUsers,
    removeProductInCart
}