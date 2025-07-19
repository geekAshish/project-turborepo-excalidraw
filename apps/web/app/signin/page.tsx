import SigninFormComponent from "../../components/SigninFormComponent";

export default function Signin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-semibold text-center text-purple-700 mb-6">
          Sign In
        </h2>
        <SigninFormComponent />
      </div>
    </div>
  );
}
