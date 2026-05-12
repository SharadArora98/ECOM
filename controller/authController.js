import user from '../model/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        //check if user already exists
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        // Hash the password        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create new user
        const newUser = new user({ username, email, password: hashedPassword, role: role || "buyer" });
        await newUser.save();

        if(newUser) {
            res.status(201).json({ success: true, message: "User registered successfully", user: { username, email } });
        } else {
            res.status(400).json({ success: false, message: "User registration failed" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    } 
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const existingUser = await user.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }
        // Check if the provided password matches the hashed password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }
        // Generate a JWT token
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email, username: existingUser.username, role: existingUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({ 
            success: true, 
            message: "User logged in successfully", 
            token,
            user: {
                id: existingUser._id,
                name: existingUser.username,
                email: existingUser.email,
                role: existingUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

async function changePassword(req,res) {
    try{
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.userId;
        const currentUser = await user.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const isMatch = await bcrypt.compare(oldPassword, currentUser.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Old password is incorrect" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);
        currentUser.password = hashedNewPassword;
        await currentUser.save();
        res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export default {
    register,
    login,
    changePassword,
};