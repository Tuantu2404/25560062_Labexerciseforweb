require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shop_mongoose_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log("-> Connected to MongoDB successfully via Mongoose ODM!"))
  .catch(err => console.error("MongoDB connection error:", err));

// =================================================================
// STEP 3 & EXTENSIONS: Schema Definition with Validations
// =================================================================
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  // --- Question 1: Phone with custom Regex validation (SĐT Việt Nam) ---
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        // Regex kiểm tra SĐT Việt Nam: 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09
        return /^(03|05|07|08|09)\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid Vietnamese phone number!`
    }
  },
  password: {
    type: String,
    default: "123456"
  },
  age: {
    type: Number,
    min: [18, 'User age must be at least 18'],
    max: [100, 'Invalid age']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'manager'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // --- Question 4: Field for Soft Delete ---
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  // --- Question 2: Enable Virtuals when serializing to JSON / Object ---
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// =================================================================
// QUESTION 2: Virtual properties
// =================================================================
userSchema.virtual('displayInfo').get(function() {
  return `${this.fullName} [${this.role.toUpperCase()}] <${this.email}>`;
});

// =================================================================
// QUESTION 3: Static methods
// =================================================================
userSchema.statics.findActiveByRole = function(roleName) {
  return this.find({ role: roleName, isActive: true })
             .sort({ fullName: 1 }); // Sắp xếp A-Z theo fullName
};

// =================================================================
// QUESTION 4: Instance methods (Soft Delete)
// =================================================================
userSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.isActive = false;
  return await this.save();
};

// =================================================================
// QUESTION 5 & STEP 4: Middleware Hooks
// =================================================================

// Pre-save hook: Mô phỏng Hash Password trước khi lưu
userSchema.pre('save', function() {
  console.log(`[Middleware Pre-save] Processing user: ${this.fullName}`);
  
  // Giả lập hash mật khẩu nếu mật khẩu bị thay đổi/mới tạo
  if (this.isModified('password') && !this.password.startsWith('hashed_')) {
    this.password = `hashed_${this.password}_secure`;
    console.log(`-> Password hashed successfully!`);
  }
});

// Pre-find hook: Tự động lọc bỏ các document có isDeleted: true
userSchema.pre(/^find/, function() {
  // Thêm điều kiện lọc isDeleted != true vào tất cả lệnh find/findOne
  this.where({ isDeleted: { $ne: true } });
});

// Tao Model
const User = mongoose.model('User', userSchema);

// =================================================================
// STEP 6 & EXTENDED TESTS: Run CRUD & Custom Methods
// =================================================================
async function runMongooseCRUD() {
  try {
    // Xóa sạch dữ liệu cũ
    await User.deleteMany({});
    console.log("--- Cleared existing collection ---\n");

    // --- TEST QUESTION 1: Custom Regex Phone Validation Error ---
    console.log("--- 1. Testing Phone Regex Validation (Invalid Case) ---");
    try {
      await User.create({
        fullName: "Test Invalid Phone",
        email: "invalid.phone@example.com",
        phone: "0123456789", // Sai đầu số (012)
        age: 20
      });
    } catch (err) {
      console.log("✅ Validation error caught correctly:", err.message);
    }

    // --- CREATE VALID USERS ---
    console.log("\n--- 2. Creating Valid Users ---");
    const user1 = await User.create({
      fullName: "Nguyen Van Hung",
      email: "hung.nguyen@example.com",
      phone: "0987654321", // SĐT hợp lệ
      age: 22,
      role: "admin",
      password: "mysecretpassword"
    });

    const user2 = await User.create({
      fullName: "Tran Thi Mai",
      email: "mai.tran@example.com",
      phone: "0356789012",
      age: 25,
      role: "user"
    });

    const user3 = await User.create({
      fullName: "An Van Binh",
      email: "binh.an@example.com",
      phone: "0912345678",
      age: 30,
      role: "admin"
    });

    // --- TEST QUESTION 2: Virtual Field ---
    console.log("\n--- 3. Testing Virtual Field (displayInfo) ---");
    console.log("Virtual Display Info:", user1.displayInfo);
    console.log("JSON Output includes virtual:", JSON.stringify(user1.toJSON(), null, 2));

    // --- TEST QUESTION 3: Static Method ---
    console.log("\n--- 4. Testing Static Method (findActiveByRole) ---");
    const activeAdmins = await User.findActiveByRole('admin');
    console.log(`Found ${activeAdmins.length} active admins (sorted A-Z):`);
    activeAdmins.forEach(u => console.log(`- ${u.fullName} (${u.role})`));

    // --- TEST QUESTION 4: Instance Method (Soft Delete) ---
    console.log("\n--- 5. Testing Instance Method (softDelete) ---");
    console.log(`Soft deleting user: ${user2.fullName}...`);
    await user2.softDelete();
    console.log("User softDeleted successfully. isDeleted =", user2.isDeleted);

    // --- TEST QUESTION 5: Pre-find Hook filtering out deleted users ---
    console.log("\n--- 6. Testing Pre-find Hook (Automatic filtering) ---");
    const allUsers = await User.find(); // Câu lệnh find() bình thường
    console.log(`Total users found after soft delete (should be 2, excluding Tran Thi Mai): ${allUsers.length}`);
    allUsers.forEach(u => console.log(`- ${u.fullName}`));

  } catch (error) {
    console.error("Mongoose error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n-> Mongoose connection closed.");
  }
}

runMongooseCRUD();