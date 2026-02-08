import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="BracePet"
        description="Best Pet care App"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
