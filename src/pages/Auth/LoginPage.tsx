
import LoginForm from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  
  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleCancel} 
            className="flex items-center text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Game
          </Button>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
