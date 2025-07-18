"use server";

import axios from "axios";

export async function signupAction(formData: {
  name: string;
  email: string;
  password: string;
  photo?: File;
}) {
  console.log(process.env.NEXT_PUBLIC_BASE_URL, formData);

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/signup`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return { success: true, data: res.data };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || "Signup failed",
    };
  }
}
