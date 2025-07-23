import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export async function signupAction(formData: {
  name: string;
  email: string;
  password: string;
  photo?: File;
}) {
  try {
    const res = await axios.post(`${BASE_URL}/signup`, formData, {
      headers: {
        // "Content-Type": "multipart/form-data",
        "Content-Type": "application/json",
      },
    });

    return { success: true, data: res.data };
  } catch (error: any) {
    console.log("this is error", error);

    return {
      success: false,
      error: error?.response?.data || "Signup failed",
    };
  }
}

export async function signinAction(formData: {
  email: string;
  password: string;
}) {
  try {
    const res = await axios.post(`${BASE_URL}/signin`, formData);

    return { success: true, data: res.data };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data || "Signin failed",
    };
  }
}
