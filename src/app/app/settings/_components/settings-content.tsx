"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Eye, EyeOff, Trash2, X, BarChart2, MessageCircle, Settings as SettingsIcon, Info, ShieldCheck, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Props {
  email: string;
  profileName: string;
  profileCity: string | null;
  profileState: string | null;
  profilePhone: string | null;
  profileAddress: string | null;
  avatarUrl: string | null;
  forcePasswordChange?: boolean;
}

type ProfileTab = "reclamacoes" | "configuracoes";
type SettingsTab = "informacoes" | "senha" | "deletar";

const PROFILE_TABS: { key: ProfileTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; href: string }[] = [
  { key: "reclamacoes", label: "Reclamações", icon: MessageCircle, href: "/app/complaints" },
  { key: "configuracoes", label: "Configurações", icon: SettingsIcon, href: "/app/settings" },
];

const SETTINGS_TABS: { key: SettingsTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "informacoes", label: "Informações", icon: Info },
  { key: "senha", label: "Senha", icon: ShieldCheck },
  { key: "deletar", label: "Deletar", icon: Trash2 },
];

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="absolute top-[58px] left-[43px] w-[137px] h-[137px] rounded-full border-4 border-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm bg-[#1E88E5]">
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-white text-5xl font-bold font-['Poppins']">
          {initials}
        </span>
      )}
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "••••••••"}
        className="h-[45px] rounded-[9px] border-[#e5e5ed] pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#607D8B] flex items-center justify-center"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function DeleteModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-black/45 z-[1000] flex items-center justify-center p-6 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl p-10 pb-8 max-w-[440px] w-full relative text-center shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-[#607D8B] flex items-center justify-center hover:text-[#455A64] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="w-[72px] h-[72px] rounded-full bg-[#FFF3EC] flex items-center justify-center mx-auto mb-5">
          <Trash2 size={32} className="text-[#E8721D]" />
        </div>

        <h3 className="text-[22px] font-bold text-[#2A3F54] mb-2.5">
          Você tem certeza?
        </h3>
        <p className="text-sm text-[#607D8B] leading-relaxed mb-2.5">
          Ao deletar sua conta iremos remover todos os seus dados do nosso banco de dados.
        </p>
        <p className="text-sm font-semibold text-[#E8721D] mb-6">
          Esta é uma ação irreversível!
        </p>

        <hr className="border-none border-t border-[#E5E5ED] mb-6" />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 border border-[#E5E5ED] rounded-[10px] bg-white text-[#2A3F54] text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              try {
                setDeleting(true);
                const response = await fetch("/api/user/account", {
                  method: "DELETE",
                });
                if (response.ok) {
                  window.location.href = "/";
                } else {
                  toast({
                    title: "Erro ao deletar conta",
                    description: "Nao foi possivel remover sua conta.",
                    variant: "destructive",
                  });
                }
              } catch {
                toast({
                  title: "Erro ao deletar conta",
                  description: "Nao foi possivel remover sua conta.",
                  variant: "destructive",
                });
              } finally {
                setDeleting(false);
              }
            }}
            disabled={deleting}
            className="flex-1 h-12 border-none rounded-[10px] bg-[#E8721D] text-white text-sm font-semibold cursor-pointer hover:bg-[#D66519] transition-colors"
          >
            {deleting ? "Deletando..." : "Deletar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsContent({
  email,
  profileName,
  profileCity,
  profileState,
  profilePhone,
  profileAddress,
  avatarUrl,
  forcePasswordChange = false,
}: Props) {
  const { toast } = useToast();
  const [activeProfileTab] = useState<ProfileTab>("configuracoes");
  const [activeTab, setActiveTab] = useState<SettingsTab>(forcePasswordChange ? "senha" : "senha");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [name, setName] = useState(profileName);
  const [phone, setPhone] = useState(profilePhone ?? "");
  const [city, setCity] = useState(profileCity ?? "");
  const [state, setState] = useState(profileState ?? "");
  const [address, setAddress] = useState(profileAddress ?? "");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const location = [profileCity, profileState].filter(Boolean).join(", ");

  return (
    <>
      {showDeleteModal && <DeleteModal onClose={() => setShowDeleteModal(false)} />}

      <div className="bg-[#F5F7FA] min-h-screen pb-12">
        <div className="max-w-[1200px] mx-auto px-6 pt-8">

          {/* ── Profile Hero Card ── */}
          <Card className="relative overflow-hidden shadow-md border-0">
            {/* Blue Banner */}
            <div className="h-[126px] bg-[#1E88E5] rounded-t-xl" />

            {/* Avatar - overlapping banner */}
            <Avatar name={profileName || "U"} avatarUrl={avatarUrl} />

            <div className="pt-[75px] pb-2.5 px-2.5">
              {/* User Name */}
              <div className="px-4 h-[30px] flex items-center">
                <h2 className="font-bold text-xl text-[#2A3F54] m-0">
                  {profileName}
                </h2>
              </div>

              {/* Location, Stats, and Action Button */}
              <div className="py-2.5 px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={18} className="text-[#607D8B]" />
                      <span className="text-[13px] text-[#607D8B]">
                        {location}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <BarChart2 size={18} className="text-[#607D8B]" />
                    <span className="text-[13px] text-[#607D8B]">Suas reclamações</span>
                  </div>
                </div>

                <Link href="/app/complaints/new">
                  <Button 
                    className="h-auto px-6 py-3 rounded-xl gap-3 bg-[#1E88E5] hover:bg-[#1976D2]"
                  >
                    <span className="text-sm font-medium">Começar uma nova reclamação</span>
                    <PlusSquare size={18} />
                  </Button>
                </Link>
              </div>

              {/* Profile Navigation Tabs */}
              <div className="flex items-center gap-4 px-4 border-t border-[#E5E5ED]">
                {PROFILE_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeProfileTab === tab.key;
                  return (
                    <Link
                      key={tab.key}
                      href={tab.href}
                      className={`flex items-center gap-1.5 py-4 px-2 no-underline border-b-2 -mb-px transition-colors ${
                        isActive ? "border-[#1E88E5]" : "border-transparent"
                      }`}
                    >
                      <Icon 
                        size={24} 
                        className={isActive ? "text-[#1E88E5]" : "text-[#607D8B]"}
                      />
                      <span 
                        className={`text-sm font-medium ${
                          isActive ? "text-[#1E88E5]" : "text-[#607D8B]"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Card>

          {forcePasswordChange ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              Sua conta foi criada com uma senha temporária. Troque sua senha agora para continuar usando a plataforma com segurança.
            </div>
          ) : null}

          {/* ── Settings Card ── */}
          <Card className="mt-5 shadow-md border-0 overflow-hidden">
            <CardContent className="p-0">
              {/* Sub-tabs */}
              <div className="flex h-14 items-center gap-4 px-4 border-b border-[#26a69a1a] bg-white">
                {SETTINGS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-2 py-4 bg-transparent border-none cursor-pointer -mb-px border-b-2 transition-colors ${
                        isActive ? "border-[#1E88E5]" : "border-transparent"
                      }`}
                    >
                      <Icon 
                        size={24} 
                        className={isActive ? "text-[#1E88E5]" : "text-[#607D8B]"}
                      />
                      <span 
                        className={`text-sm font-medium ${
                          isActive ? "text-[#1E88E5]" : "text-[#607D8B]"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 px-4">
                {/* ── Informações ── */}
                {activeTab === "informacoes" && (
                  <div className="pt-3">
                    <div className="mb-4 max-w-[400px]">
                      <Label 
                        htmlFor="name"
                        className="text-sm font-medium mb-1.5 block text-[#232360]"
                      >
                        Nome completo
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="h-[45px] rounded-[9px] border-[#e5e5ed]"
                      />
                    </div>

                    <div className="mb-4 max-w-[400px]">
                      <Label 
                        htmlFor="email"
                        className="text-sm font-medium mb-1.5 block text-[#232360]"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="h-[45px] rounded-[9px] border-[#e5e5ed] bg-gray-50"
                      />
                      <p className="text-xs text-[#607D8B] mt-1">
                        O e-mail não pode ser alterado.
                      </p>
                    </div>

                    <div className="mb-4 max-w-[400px]">
                      <Label 
                        htmlFor="phone"
                        className="text-sm font-medium mb-1.5 block text-[#232360]"
                      >
                        Telefone
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(xx) 1234-56789"
                        className="h-[45px] rounded-[9px] border-[#e5e5ed]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 max-w-[400px]">
                      <div>
                        <Label 
                          htmlFor="city"
                          className="text-sm font-medium mb-1.5 block text-[#232360]"
                        >
                          Cidade
                        </Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Sua cidade"
                          className="h-[45px] rounded-[9px] border-[#e5e5ed]"
                        />
                      </div>
                      <div>
                        <Label 
                          htmlFor="state"
                          className="text-sm font-medium mb-1.5 block text-[#232360]"
                        >
                          Estado
                        </Label>
                        <Input
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="UF"
                          className="h-[45px] rounded-[9px] border-[#e5e5ed]"
                        />
                      </div>
                    </div>

                    <div className="mb-7 max-w-[400px]">
                      <Label 
                        htmlFor="address"
                        className="text-sm font-medium mb-1.5 block text-[#232360]"
                      >
                        Endereço
                      </Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Rua, número, bairro"
                        className="h-[45px] rounded-[9px] border-[#e5e5ed]"
                      />
                    </div>

                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        className="h-auto px-6 py-3 rounded-lg"
                        onClick={() => {
                          setName(profileName);
                          setPhone(profilePhone ?? "");
                          setCity(profileCity ?? "");
                          setState(profileState ?? "");
                          setAddress(profileAddress ?? "");
                        }}
                      >
                        <span className="text-sm font-medium text-black">Cancelar</span>
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            setSavingProfile(true);
                            const response = await fetch("/api/user/profile", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ name, phone, city, state, address }),
                            });
                            if (response.ok) {
                              toast({
                                title: "Perfil atualizado",
                                description: "Suas informacoes foram salvas.",
                              });
                            } else {
                              toast({
                                title: "Erro ao salvar perfil",
                                description: "Nao foi possivel salvar suas informacoes.",
                                variant: "destructive",
                              });
                            }
                          } catch {
                            toast({
                              title: "Erro ao salvar perfil",
                              description: "Nao foi possivel salvar suas informacoes.",
                              variant: "destructive",
                            });
                          } finally {
                            setSavingProfile(false);
                          }
                        }}
                        disabled={savingProfile}
                        className="h-auto px-6 py-3 rounded-lg bg-[#1E88E5] hover:bg-[#1976D2]"
                      >
                        <span className="text-sm font-medium">{savingProfile ? "Salvando..." : "Salvar"}</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── Senha ── */}
                {activeTab === "senha" && (
                  <div className="pt-3">
                    <div className="mb-4 max-w-[400px]">
                      <Label 
                        htmlFor="current-password"
                        className="text-sm font-medium mb-1.5 block text-[#232360]"
                      >
                        Senha atual
                      </Label>
                      <PasswordInput 
                        value={currentPwd} 
                        onChange={setCurrentPwd}
                        placeholder="Digite sua senha atual"
                      />
                    </div>

                    <div className="mb-4 max-w-[400px]">
                      <Label 
                        htmlFor="new-password"
                        className="text-sm font-medium mb-1.5 block text-[#232360]"
                      >
                        Nova senha
                      </Label>
                      <PasswordInput 
                        value={newPwd} 
                        onChange={setNewPwd}
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>

                    <div className="mb-7 max-w-[400px]">
                      <Label 
                        htmlFor="confirm-password"
                        className="text-sm font-medium mb-1.5 block text-[#232360]"
                      >
                        Confirmar nova senha
                      </Label>
                      <PasswordInput 
                        value={confirmPwd} 
                        onChange={setConfirmPwd}
                        placeholder="Repita a nova senha"
                      />
                    </div>

                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        className="h-auto px-6 py-3 rounded-lg"
                        onClick={() => {
                          setCurrentPwd("");
                          setNewPwd("");
                          setConfirmPwd("");
                        }}
                      >
                        <span className="text-sm font-medium text-black">Cancelar</span>
                      </Button>
                      <Button
                        onClick={async () => {
                          if (newPwd !== confirmPwd) {
                            toast({
                              title: "Senhas divergentes",
                              description: "As senhas nao coincidem.",
                              variant: "destructive",
                            });
                            return;
                          }
                          if (newPwd.length < 8) {
                            toast({
                              title: "Senha invalida",
                              description: "A senha deve ter no minimo 8 caracteres.",
                              variant: "destructive",
                            });
                            return;
                          }
                          try {
                            setSavingPassword(true);
                            const response = await fetch("/api/auth/change-password", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ 
                                currentPassword: currentPwd, 
                                newPassword: newPwd 
                              }),
                            });
                            const data = await response.json();
                            if (response.ok) {
                              toast({
                                title: "Senha alterada",
                                description: "Sua senha foi atualizada com sucesso.",
                              });
                              setCurrentPwd("");
                              setNewPwd("");
                              setConfirmPwd("");
                            } else {
                              toast({
                                title: "Erro ao alterar senha",
                                description: data.error || "Nao foi possivel alterar sua senha.",
                                variant: "destructive",
                              });
                            }
                          } catch {
                            toast({
                              title: "Erro ao alterar senha",
                              description: "Nao foi possivel alterar sua senha.",
                              variant: "destructive",
                            });
                          } finally {
                            setSavingPassword(false);
                          }
                        }}
                        disabled={savingPassword}
                        className="h-auto px-6 py-3 rounded-lg bg-[#1E88E5] hover:bg-[#1976D2]"
                      >
                        <span className="text-sm font-medium">{savingPassword ? "Salvando..." : "Salvar"}</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── Deletar ── */}
                {activeTab === "deletar" && (
                  <div className="pt-3 max-w-[560px]">
                    <div className="border border-[#FED7AA] rounded-xl p-5 bg-[#FFF7ED] mb-6">
                      <p className="text-sm text-[#2A3F54] m-0 leading-relaxed">
                        Ao deletar sua conta, todos os seus dados serão permanentemente removidos — reclamações, mensagens e informações pessoais.{" "}
                        <strong className="text-[#E8721D]">Esta ação não pode ser desfeita.</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="h-[46px] px-6 border-none rounded-[10px] bg-[#E8721D] text-white text-sm font-semibold cursor-pointer flex items-center gap-2 hover:bg-[#D66519] transition-colors"
                    >
                      <Trash2 size={16} />
                      Deletar minha conta
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
