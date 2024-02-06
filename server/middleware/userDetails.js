function userAuth(req, res, next) {
  const {
    phoneNumber,
    employeeType,
    deparatment,
    id,
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    address,
  } = req.body;
  console.log(req.body, "HERE");
  if (phoneNumber.length !== 10) {
    console.log("TRUE");
    res.status(400).json({ msg: "Please enter proper phone number" });
  } else if (
    employeeType == "" ||
    deparatment == "" ||
    firstName == "" ||
    lastName == "" ||
    email == "" ||
    password == "" ||
    confirmPassword == "" ||
    phoneNumber == "" ||
    address == ""
  ) {
    console.log("TRU");
    res.status(400).json({ msg: "Please re-enter all the fields" });
  } else {
    next();
  }
}

module.exports = { userAuth };
