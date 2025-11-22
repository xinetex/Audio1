import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, Music, Sparkles, Video, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { APP_TITLE, getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentProject, setCurrentProject] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [generationProgress, setGenerationProgress] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProjectMutation = trpc.project.create.useMutation();
  const uploadAudioMutation = trpc.project.uploadAudio.useMutation();
  const analyzeAudioMutation = trpc.project.analyzeAudio.useMutation();
  const generateSegmentsMutation = trpc.video.generateSegments.useMutation();
  const { data: progressData, refetch: refetchProgress } = trpc.video.checkProgress.useQuery(
    { projectId: currentProject! },
    { enabled: !!currentProject && !!generationProgress, refetchInterval: 5000 }
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error("Please select an audio file");
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    } else {
      toast.error("Please drop an audio file");
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile || !isAuthenticated) return;

    try {
      toast.info("Creating project...");
      const project = await createProjectMutation.mutateAsync({
        title: selectedFile.name.replace(/\.[^/.]+$/, ""),
      });
      
      setCurrentProject(project.id);

      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        toast.info("Uploading audio file...");
        await uploadAudioMutation.mutateAsync({
          projectId: project.id,
          fileName: selectedFile.name,
          fileData: base64,
        });

        toast.info("Analyzing music... This may take a minute.");
        const analysis = await analyzeAudioMutation.mutateAsync({
          projectId: project.id,
        });

        setAnalysisResult(analysis);
        toast.success("Analysis complete! Ready to generate video.");
      };
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process audio");
    }
  };

  const handleGenerateVideo = async () => {
    if (!analysisResult || !currentProject) return;

    try {
      toast.info("Starting video generation...");
      
      await generateSegmentsMutation.mutateAsync({
        projectId: currentProject,
        prompts: analysisResult.prompts,
      });

      setGenerationProgress({ started: true });
      toast.success("Video generation started! This will take several minutes.");
      
      refetchProgress();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start video generation");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 animated-gradient">
        <Card className="glass-strong shadow-soft-lg max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">{APP_TITLE}</CardTitle>
            <CardDescription className="text-base">
              Transform your music into stunning AI-generated videos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Sign in to Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent gradient-primary inline-block">
            {APP_TITLE}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your music, let AI analyze the tempo, mood, and structure, then generate a synchronized music video
          </p>
        </div>

        {!selectedFile && !currentProject && (
          <Card className="glass shadow-soft-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Your Music
              </CardTitle>
              <CardDescription>
                Supports MP3, WAV, OGG, and other audio formats (max 50MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-primary/30 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Music className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Drop your audio file here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {selectedFile && !analysisResult && (
          <Card className="glass shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                {selectedFile.name}
              </CardTitle>
              <CardDescription>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full gradient-primary text-white"
                onClick={handleUploadAndAnalyze}
                disabled={uploadAudioMutation.isPending || analyzeAudioMutation.isPending}
              >
                {analyzeAudioMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Music...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze & Generate Video
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedFile(null)}
                disabled={uploadAudioMutation.isPending || analyzeAudioMutation.isPending}
              >
                Choose Different File
              </Button>
            </CardContent>
          </Card>
        )}

        {analysisResult && !generationProgress && (
          <Card className="glass shadow-soft-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Music Analysis Complete
              </CardTitle>
              <CardDescription>
                AI has analyzed your music and generated creative prompts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="text-sm text-muted-foreground">Tempo</div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(analysisResult.analysis.tempo)} BPM
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/10">
                  <div className="text-sm text-muted-foreground">Mood</div>
                  <div className="text-2xl font-bold text-secondary capitalize">
                    {analysisResult.analysis.mood}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                  <div className="text-sm text-muted-foreground">Key</div>
                  <div className="text-2xl font-bold text-accent">
                    {analysisResult.analysis.musicalKey}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="text-sm text-muted-foreground">Segments</div>
                  <div className="text-2xl font-bold text-primary">
                    {analysisResult.prompts.length}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Video Segments ({analysisResult.prompts.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {analysisResult.prompts.slice(0, 3).map((prompt: any, index: number) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/30 text-sm">
                      <div className="font-medium text-primary mb-1">
                        Segment {index + 1} ({prompt.startTime.toFixed(1)}s - {prompt.endTime.toFixed(1)}s)
                      </div>
                      <div className="text-muted-foreground line-clamp-2">{prompt.prompt}</div>
                    </div>
                  ))}
                  {analysisResult.prompts.length > 3 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      + {analysisResult.prompts.length - 3} more segments...
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full gradient-primary text-white"
                size="lg"
                onClick={handleGenerateVideo}
                disabled={generateSegmentsMutation.isPending}
              >
                {generateSegmentsMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting Generation...
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5 mr-2" />
                    Generate Music Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {generationProgress && progressData && (
          <Card className="glass shadow-soft-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 animate-pulse" />
                Generating Video Segments
              </CardTitle>
              <CardDescription>
                This may take several minutes. You can leave this page and come back later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Overall Progress</span>
                  <span className="text-muted-foreground">
                    {progressData.completed} / {progressData.total} segments
                  </span>
                </div>
                <Progress 
                  value={(progressData.completed / progressData.total) * 100} 
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-sm text-muted-foreground">Completed</div>
                  <div className="text-2xl font-bold text-green-600">{progressData.completed}</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-sm text-muted-foreground">Processing</div>
                  <div className="text-2xl font-bold text-blue-600">{progressData.processing}</div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-sm text-muted-foreground">Failed</div>
                  <div className="text-2xl font-bold text-red-600">{progressData.failed}</div>
                </div>
              </div>

              {progressData.completed === progressData.total && progressData.failed === 0 && (
                <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                  <div className="text-green-600 font-semibold mb-2">
                    ✓ All segments generated successfully!
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your music video is ready. Check your project list to view and download.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setCurrentProject(null);
                      setAnalysisResult(null);
                      setGenerationProgress(null);
                    }}
                  >
                    Create Another Video
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
