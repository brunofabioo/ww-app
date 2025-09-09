import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useSupabase";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  Upload,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone?: string;
  address?: string;
  bio?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para dados do perfil
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Estados para alteração de senha
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Estados para verificação de email
  const [newEmail, setNewEmail] = useState("");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);

  // Estados para preview de avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarPath, setPendingAvatarPath] = useState<string | null>(null);

  // Carregar dados do perfil
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      const profileData = {
        id: data.id,
        email: data.email || user?.email || "",
        full_name: data.full_name || "",
        avatar_url: data.avatar_url,
        phone: data.phone ? formatPhone(data.phone) : "",
        address: data.address || "",
        bio: data.bio || "",
      };

      setProfile(profileData);
      setOriginalProfile(profileData);
      setNewEmail(profileData.email);
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para converter imagem para WebP
  const convertToWebP = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Definir tamanho máximo para otimização
        const maxSize = 800;
        let { width, height } = img;
        
        // Redimensionar se necessário mantendo proporção
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem no canvas
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Converter para WebP com qualidade 0.3
         canvas.toBlob(
           (blob) => {
             if (blob) {
               resolve(blob);
             } else {
               reject(new Error('Falha na conversão para WebP'));
             }
           },
           'image/webp',
           0.3
         );
      };
      
      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload de avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingAvatar(true);

      // Converter para WebP
      const webpBlob = await convertToWebP(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(webpBlob);

      // Upload para o Supabase Storage
      const fileName = `${Date.now()}.webp`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("user-uploads")
        .upload(filePath, webpBlob, {
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("user-uploads")
        .getPublicUrl(filePath);

      // Armazenar caminho da imagem pendente (não salvar no perfil ainda)
      console.log("Definindo pendingAvatarPath:", filePath);
      setPendingAvatarPath(filePath);

      toast({
        title: "Sucesso",
        description: "Foto de perfil salva!",
      });
    } catch (error: any) {
      console.error("Erro ao fazer upload do avatar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Cancelar upload de avatar
  const handleCancelAvatarUpload = async () => {
    try {
      console.log("Cancelando upload. pendingAvatarPath:", pendingAvatarPath);
      
      // Se há uma imagem pendente no bucket, deletá-la
      if (pendingAvatarPath) {
        console.log("Tentando deletar arquivo:", pendingAvatarPath);
        
        const { data, error: deleteError } = await supabase.storage
          .from("user-uploads")
          .remove([pendingAvatarPath]);

        if (deleteError) {
          console.error("Erro ao deletar imagem do bucket:", deleteError);
          toast({
            title: "Erro",
            description: `Erro ao deletar imagem: ${deleteError.message}`,
            variant: "destructive",
          });
          return;
        }
        
        console.log("Arquivo deletado com sucesso:", data);
        
        toast({
          title: "Sucesso",
          description: "Foto removida!",
        });
      } else {
        console.log("Nenhuma imagem pendente para deletar");
        toast({
          title: "Sucesso",
          description: "Foto removida!",
        });
      }

      // Limpar estados
      setAvatarPreview(null);
      setPendingAvatarPath(null);
      
    } catch (error: any) {
      console.error("Erro ao cancelar upload:", error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar upload da imagem.",
        variant: "destructive",
      });
    }
  };

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a máscara (99) 99999-9999
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  // Salvamento automático do perfil
  const handleAutoSaveProfile = async (field: string, value: string) => {
    try {
      const updateData: any = {};
      updateData[field] = value;
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      // Atualizar estado original para refletir que foi salvo
      setOriginalProfile(prev => ({ ...prev, [field]: value }));

      toast({
        title: "Salvo",
        description: "Alteração salva automaticamente.",
      });
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a alteração.",
        variant: "destructive",
      });
    }
  };

  // Salvar alterações do perfil (mantido para avatar)
  const handleSaveProfile = async () => {
    if (!profile || !user) return;

    try {
      setSaving(true);

      let avatarUrl = profile.avatar_url;

      // Se há uma imagem pendente, obter sua URL pública
      if (pendingAvatarPath) {
        const { data: { publicUrl } } = supabase.storage
          .from("user-uploads")
          .getPublicUrl(pendingAvatarPath);
        avatarUrl = publicUrl;

        const { error } = await supabase
          .from("users")
          .update({ 
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .eq("id", user.id);

        if (error) throw error;

        // Atualizar estado local
        setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
        setOriginalProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
        setPendingAvatarPath(null);
        setAvatarPreview(null);

        toast({
          title: "Sucesso",
          description: "Foto de perfil salva!",
        });
      }
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Alterar senha
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos de senha.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "A nova senha e a confirmação não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setChangingPassword(true);

      // Verificar senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: passwordData.currentPassword,
      });

      if (signInError) {
        toast({
          title: "Erro",
          description: "Senha atual incorreta.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) throw updateError;

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Alterar email
  const handleChangeEmail = async () => {
    if (!newEmail || newEmail === profile?.email) {
      toast({
        title: "Erro",
        description: "Por favor, insira um novo email válido.",
        variant: "destructive",
      });
      return;
    }

    // Prevenir múltiplos cliques
    if (changingEmail) {
      return;
    }

    // Verificar se já foi enviado recentemente
    if (emailVerificationSent) {
      toast({
        title: "Aviso",
        description: "Um email de verificação já foi enviado. Aguarde alguns minutos antes de tentar novamente.",
        variant: "default",
      });
      return;
    }

    try {
      setChangingEmail(true);

      const { error } = await supabase.auth.updateUser({
        email: newEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      if (error) throw error;

      setEmailVerificationSent(true);

      toast({
        title: "Verificação enviada",
        description: "Um link de verificação foi enviado para o novo email.",
      });

      // Reset após 5 minutos para permitir novo envio se necessário
      setTimeout(() => {
        setEmailVerificationSent(false);
      }, 300000); // 5 minutos

    } catch (error: any) {
      console.error("Erro ao alterar email:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o email.",
        variant: "destructive",
      });
    } finally {
      setChangingEmail(false);
    }
  };



  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
            <span className="ml-2 text-lg">Carregando perfil...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-0 bg-white/70 card-enhanced">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Erro ao carregar perfil
              </h3>
              <p className="text-gray-600 mb-6">
                Não foi possível carregar os dados do seu perfil.
              </p>
              <Button onClick={loadProfile}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-jakarta font-bold text-slate-900">
            Meu Perfil
          </h1>
          <p className="text-lg text-slate-600">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>

        {/* Foto de Perfil */}
        <Card className="border-0 bg-white/70 card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-brand-purple" />
              <span>Foto de Perfil</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage 
                    src={avatarPreview || profile.avatar_url || ""} 
                    alt={profile.full_name} 
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-100 to-pink-100 text-brand-purple">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{profile.full_name}</h3>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingAvatar ? "Enviando..." : "Alterar Foto"}
                  </Button>
                  {avatarPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelAvatarUpload}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Formatos aceitos: JPG, PNG, GIF. Máximo 5MB.
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Informações Pessoais */}
        <Card className="border-0 bg-white/70 card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-brand-purple" />
              <span>Informações Pessoais</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  onBlur={(e) => handleAutoSaveProfile('full_name', e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                   type="tel"
                   value={profile.phone || ""}
                   onChange={(e) => {
                     const formattedPhone = formatPhone(e.target.value);
                     setProfile({ ...profile, phone: formattedPhone });
                   }}
                   onBlur={(e) => {
                     // Remove a máscara antes de salvar (apenas números)
                     const numbersOnly = e.target.value.replace(/\D/g, '');
                     handleAutoSaveProfile('phone', numbersOnly);
                   }}
                   placeholder="(11) 99999-9999"
                   maxLength={15}
                 />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={profile.address || ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                onBlur={(e) => handleAutoSaveProfile('address', e.target.value)}
                placeholder="Seu endereço completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                onBlur={(e) => handleAutoSaveProfile('bio', e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="border-0 bg-white/70 card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-brand-purple" />
              <span>Email</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentEmail">Email Atual</Label>
                <Input
                  id="currentEmail"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEmail">Novo Email</Label>
                <div className="flex space-x-2">
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="novo@email.com"
                  />
                  <Button
                    onClick={handleChangeEmail}
                    disabled={changingEmail || newEmail === profile.email}
                  >
                    {changingEmail ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Alterar"
                    )}
                  </Button>
                </div>
              </div>
              {emailVerificationSent && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Link de verificação enviado! Verifique seu email para confirmar a alteração.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Senha */}
        <Card className="border-0 bg-white/70 card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-brand-purple" />
              <span>Alterar Senha</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Digite a nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirme a nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Alterando Senha...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>


      </div>
    </Layout>
  );
}