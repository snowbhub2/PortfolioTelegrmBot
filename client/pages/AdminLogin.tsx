import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart3, Eye, EyeOff, Shield } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactor: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"login" | "2fa">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (step === "login") {
        // Mock authentication - in real app would be API call
        if (formData.email === "admin@platform.com" && formData.password === "admin123") {
          setStep("2fa");
        } else {
          setError("Неверный email или пароль");
        }
      } else {
        // Mock 2FA verification
        if (formData.twoFactor === "123456") {
          // Store admin token
          localStorage.setItem("admin_token", "admin_authenticated");
          localStorage.setItem("admin_user", JSON.stringify({
            id: "admin-1",
            name: "Админ",
            email: formData.email,
            role: "super_admin"
          }));
          
          navigate("/admin");
        } else {
          setError("Неверный код двухфакторной аутентификации");
        }
      }
    } catch (err) {
      setError("Произошла ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              {step === "login" ? (
                <BarChart3 className="w-6 h-6 text-white" />
              ) : (
                <Shield className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "login" ? "Админ Панель" : "Двухфакторная аутентификация"}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {step === "login" 
              ? "Войдите в административную панель" 
              : "Введите код из приложения аутентификации"
            }
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === "login" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="admin@platform.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Введите пароль"
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="twoFactor">Код подтверждения</Label>
                <Input
                  id="twoFactor"
                  type="text"
                  value={formData.twoFactor}
                  onChange={(e) => handleInputChange("twoFactor", e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-sm text-gray-500 text-center">
                  Введите 6-значный код из Google Authenticator
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Проверка..." : step === "login" ? "Войти" : "Подтвердить"}
            </Button>

            {step === "2fa" && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("login")}
                disabled={isLoading}
              >
                Назад к вводу пароля
              </Button>
            )}
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-1">Демо-доступ:</p>
            <p className="text-xs text-gray-500">Email: admin@platform.com</p>
            <p className="text-xs text-gray-500">Пароль: admin123</p>
            <p className="text-xs text-gray-500">2FA код: 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
