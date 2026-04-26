import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, Unlock, Eye, EyeOff, Camera, Calendar, 
  Trash2, Shield, AlertCircle, Plus, ChevronRight, X
} from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { logProgressPhoto, updateVaultPin, deleteProgressPhoto } from "@/services/firestore";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

const Vault = () => {
  const { user, progressPhotos, vaultPin, loading } = useUserData();
  const { toast } = useToast();
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLogging, setIsLogging] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUnlock = () => {
    if (pinInput === vaultPin) {
      setUnlocked(true);
      toast({ title: "Vault Unlocked", description: "Welcome to your private gallery." });
    } else {
      toast({ title: "Access Denied", description: "Incorrect 6-digit PIN.", variant: "destructive" });
      setPinInput("");
    }
  };

  const handleSetPin = async () => {
    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      toast({ title: "Invalid PIN", description: "Please enter exactly 6 digits.", variant: "destructive" });
      return;
    }
    if (!user) return;
    try {
      await updateVaultPin(user.uid, newPin);
      toast({ title: "PIN Secured", description: "Your vault is now protected." });
      setIsSettingPin(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to update security.", variant: "destructive" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7)); // 70% quality JPEG
        };
      };
    });
  };

  const handleAddPhoto = async () => {
    if (!selectedFile || !user) return;
    setIsLogging(true);
    try {
      console.log("[Vault] Compressing photo for database storage...");
      const base64Data = await compressImage(selectedFile);
      
      console.log("[Vault] Saving to database...");
      await logProgressPhoto(user.uid, {
        url: base64Data, // Storing base64 string directly
        date: photoDate,
      });

      toast({ title: "Photo Secured", description: "Your progress has been encrypted and stored." });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("[Vault] Error:", err);
      toast({ 
        title: "Secure Save Failed", 
        description: "Could not save to database. Please try a smaller image.", 
        variant: "destructive" 
      });
    } finally {
      setIsLogging(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deleteProgressPhoto(photoId);
      toast({ title: "Photo Deleted", description: "The image has been removed from your vault." });
    } catch (err) {
      toast({ title: "Error", description: "Could not delete the photo.", variant: "destructive" });
    }
  };

  if (!vaultPin) {
    return (
      <DashboardLayout title="Secure Vault" subtitle="Private Progress Library">
        <div className="max-w-md mx-auto mt-20 text-center space-y-8 p-8 rounded-3xl bg-surface-1 border border-border/40 shadow-2xl">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary animate-pulse">
            <Shield className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold">Secure Your Gallery</h2>
            <p className="text-muted-foreground text-sm">Create a 6-digit PIN to protect your private progress photos.</p>
          </div>
          <div className="space-y-4">
            <Input 
              type="password" 
              maxLength={6} 
              placeholder="CREATE 6-DIGIT PIN" 
              className="text-center text-xl h-14 bg-surface-2 border-border/40 focus:border-primary/50 transition-all placeholder:text-xs placeholder:tracking-widest"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            />
            <Button variant="hero" className="w-full h-12 text-lg font-bold" onClick={handleSetPin}>
              Initialize Vault
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!unlocked) {
    return (
      <DashboardLayout title="Secure Vault" subtitle="Privacy Protected">
        <div className="max-w-md mx-auto mt-20 text-center space-y-8 p-8 rounded-3xl bg-surface-1 border border-border/40 shadow-2xl">
          <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-400">
            <Lock className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold">Vault Locked</h2>
            <p className="text-muted-foreground text-sm">Enter your 6-digit passcode to proceed.</p>
          </div>
          <div className="space-y-4">
            <Input 
              type="password" 
              maxLength={6} 
              placeholder="ENTER PIN" 
              className="text-center text-xl h-14 bg-surface-2 border-border/40 focus:border-primary/50 transition-all placeholder:text-xs placeholder:tracking-widest"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            />
            <Button variant="hero" className="w-full h-12 text-lg font-bold" onClick={handleUnlock}>
              Unlock Access
            </Button>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Encrypted Locally</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Private Vault" 
      subtitle="Your physical transformation, secured."
      action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setUnlocked(false)}>
            <Lock className="h-4 w-4 mr-2" /> Lock
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm"><Plus className="h-4 w-4 mr-2" /> Add Photo</Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-card border-border/50">
              <DialogHeader>
                <DialogTitle>Secure Progress Upload</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Progress Photo</Label>
                  <div className="border-2 border-dashed border-border/40 rounded-xl p-4 text-center space-y-3 bg-surface-1">
                    {previewUrl ? (
                      <div className="relative group">
                        <img src={previewUrl} className="max-h-40 mx-auto rounded-lg shadow-lg" alt="Preview" />
                        <button 
                          onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                          className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-2">
                        <Camera className="h-8 w-8 mx-auto text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground">Click to browse or drop image</p>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date of Photo</Label>
                  <Input type="date" value={photoDate} onChange={(e) => setPhotoDate(e.target.value)} className="bg-surface-1 border-border/40" />
                </div>
                <Button variant="hero" className="w-full" onClick={handleAddPhoto} disabled={isLogging || !selectedFile}>
                  {isLogging ? "Encrypting & Uploading..." : "Secure to Vault"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {progressPhotos.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border/40 rounded-3xl">
            <Camera className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground italic">No photos in the vault yet.</p>
          </div>
        ) : (
          progressPhotos.map((photo, i) => (
            <Dialog key={photo.id}>
              <DialogTrigger asChild>
                <Card 
                  className="group relative h-32 flex flex-col items-center justify-center rounded-2xl border-border/50 bg-gradient-to-br from-surface-2 to-surface-1 cursor-pointer hover:border-primary/50 hover:shadow-primary/5 transition-all shadow-xl"
                >
                  <Calendar className="h-6 w-6 text-muted-foreground/40 mb-2 group-hover:text-primary/60 transition-colors" />
                  <span className="text-sm font-medium">
                    {new Date(photo.date).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-surface-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-black/95 border-white/10 p-0 overflow-hidden">
                <DialogHeader className="sr-only">
                  <DialogTitle>Progress Photo Preview</DialogTitle>
                  <DialogDescription>Viewing progress from {photo.date}</DialogDescription>
                </DialogHeader>
                <div className="relative w-full h-[80vh] flex items-center justify-center">
                  <img 
                    src={photo.url} 
                    className="max-h-full max-w-full object-contain" 
                    alt={`Progress on ${photo.date}`}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-bold">Progress Snapshot</h3>
                        <p className="text-white/60 text-sm">{new Date(photo.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeletePhoto(photo.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))
        )}
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <button 
            className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="max-w-4xl w-full h-full flex flex-col items-center justify-center gap-6">
            <img 
              src={selectedPhoto.url} 
              className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl" 
              alt="Full view"
            />
            <div className="text-center space-y-2">
              <div className="text-2xl font-display font-bold text-white">
                {new Date(selectedPhoto.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </div>
              <Badge variant="outline" className="text-indigo-300 border-indigo-500/30">Privately Stored</Badge>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Vault;
