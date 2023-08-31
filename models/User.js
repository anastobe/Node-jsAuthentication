import mongoose from "mongoose";

// Defining Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  password_confirmation: { type: String, required: true, trim: true },
  tc: { type: Boolean, required: true },
  type: { type: String, required: true, trim: true  },
  payment: { type: Boolean, required: true },
  profileImage:  { type: String}
})

const addUserJobSchema = new mongoose.Schema({
  userImg: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  List: { type: Array, required: true }
});

const addVendorJobSchema = new mongoose.Schema({
  userImg: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  packageList: {
  noofpanels: { type: String, required: true },
  battery: { type: String, required: true },
  price: { type: String, required: true },
  area: { type: String, required: true },
  extraExpense: { type: String, required: true },
  ttklWatts: { type: String, required: true },
  daysForInstalation: { type: String, required: true },
}}
);


// Model
const UserModel = mongoose.model("user", userSchema)
const AddUserJobModel = mongoose.model("userJobs", addUserJobSchema)
const AddVendorJobModel = mongoose.model("vendorJobs", addVendorJobSchema)

export {UserModel, AddUserJobModel, AddVendorJobModel} 