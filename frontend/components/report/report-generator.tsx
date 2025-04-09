"use client"

import { useState } from "react"
import {
  Download,
  FileText,
  Loader2,
  PresentationIcon,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AgentStepVisualizer } from "./agent-step-visualizer"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportPreview } from "./report-preview"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export interface ReportStep {
  id: string
  description: string
  status: "pending" | "processing" | "completed" | "error"
  sql?: string
  result?: any[]
  columns?: { key: string; label: string }[]
}

interface ReportGeneratorProps {
  databaseName?: string
  chatId: string
  onClose?: () => void
}

export function ReportGenerator({ databaseName = "Database", chatId, onClose }: ReportGeneratorProps) {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState("")
  const [title, setTitle] = useState("")
  const [format, setFormat] = useState("pdf")
  const [includeVisualizations, setIncludeVisualizations] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState("")
  const [reportSteps, setReportSteps] = useState<ReportStep[]>([])
  const [activeTab, setActiveTab] = useState("configure")
  const [isProgressExpanded, setIsProgressExpanded] = useState(true)
  const [previewData, setPreviewData] = useState<any>(null)

  // Extended options
  const [isPromptLoading, setIsPromptLoading] = useState(false)
  const [advancedOptions, setAdvancedOptions] = useState(false)
  const [reportTemplate, setReportTemplate] = useState("standard")
  const [colorScheme, setColorScheme] = useState("default")
  const [chartType, setChartType] = useState("auto")
  const [maxPages, setMaxPages] = useState([10])
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true)
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true)
  const [includeRawData, setIncludeRawData] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim() || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a report prompt and title",
        variant: "destructive",
      });
      return;
    }

    
  
    setIsGenerating(true);
    setIsComplete(false);
    setReportSteps([]);
    setActiveTab("progress");
  
    try {
      const response = await fetch("http://localhost:5000/api/agent/generate_report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          title,
          format,
          chatId,
          includeVisualizations,
          // Include additional options if needed, e.g.,
          // includeVisualizations,
          // advancedOptions: { reportTemplate, colorScheme, chartType, maxPages, includeTableOfContents, includeExecutiveSummary, includeRawData }
        }),
      });
      console.log("Response :", includeVisualizations);
      if (!response.ok) {
        throw new Error("Failed to generate report");
      }
  
      const data = await response.json();
      // Update the steps from backend
      setReportSteps(data.steps);
      // Update the preview data and download URL from backend
      setPreviewData(data.previewData);
      setDownloadUrl(data.downloadUrl);
      setIsComplete(true);
      setActiveTab("preview");
  
      toast({
        title: "Report generated successfully",
        description: `Your ${format.toUpperCase()} report is ready to preview and download`,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error generating report",
        description: "An error occurred while generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSmartPrompt = async () => {
    setIsPromptLoading(true);
    setPrompt(""); // 🚨 clear existing text to show loading placeholder
    try {
      const response = await fetch("http://localhost:5000/api/agent/smart_prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate smart prompt");
      }
  
      const data = await response.json();
      if (data.prompt) {
        setPrompt(data.prompt);
        toast({
          title: "Prompt generated!",
          description: "An AI-generated prompt was added to your report field.",
        });
      }
    } catch (error) {
      console.error("AI prompt generation failed:", error);
      toast({
        title: "Prompt generation failed",
        description: "Could not generate prompt from AI.",
        variant: "destructive",
      });
    } finally {
      setIsPromptLoading(false);
    }
  };
  

  const handleDownload = () => {
    // In a real implementation, this would download the actual file
    toast({
      title: "Downloading report",
      description: `${title}.${format} is being downloaded`,
    })
  }

  const handleRegenerate = () => {
    setActiveTab("configure")
    setIsComplete(false)
    setPreviewData(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
        <CardDescription>Create a custom report from your database using natural language</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="progress" disabled={reportSteps.length === 0}>
              Progress
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!previewData}>
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="space-y-6">
            <div className="space-y-2 relative">
              <Label htmlFor="prompt" className="flex justify-between items-center">
                Report Prompt
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={generateSmartPrompt}
                  className="text-purple-600 hover:text-purple-800"
                  disabled={isGenerating || isPromptLoading}
                >
                  {isPromptLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  <span className="sr-only">Generate Prompt</span>
                </Button>
              </Label>
              <Textarea
                id="prompt"
                placeholder={
                  isPromptLoading
                    ? "Generating smart prompt using AI..."
                    : "Describe the report you want to generate (e.g., 'Create a monthly sales report showing top products and revenue trends')"
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
                disabled={isGenerating || isPromptLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label>Report Format</Label>
              <RadioGroup value={format} onValueChange={setFormat} className="flex space-x-4" disabled={isGenerating}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    PDF
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pptx" id="pptx" />
                  <Label htmlFor="pptx" className="flex items-center">
                    <PresentationIcon className="mr-2 h-4 w-4" />
                    PowerPoint
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="visualizations"
                checked={includeVisualizations}
                onCheckedChange={setIncludeVisualizations}
                disabled={isGenerating}
              />
              <Label htmlFor="visualizations">Include data visualizations</Label>
            </div>

            <Collapsible open={advancedOptions} onOpenChange={setAdvancedOptions} className="border rounded-md p-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-between p-2">
                  <span>Advanced Options</span>
                  {advancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="template">Report Template</Label>
                  <Select value={reportTemplate} onValueChange={setReportTemplate} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colorScheme">Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={setColorScheme} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chartType">Chart Type Preference</Label>
                  <Select value={chartType} onValueChange={setChartType} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (AI selected)</SelectItem>
                      <SelectItem value="bar">Bar Charts</SelectItem>
                      <SelectItem value="line">Line Charts</SelectItem>
                      <SelectItem value="pie">Pie Charts</SelectItem>
                      <SelectItem value="scatter">Scatter Plots</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="maxPages">Maximum Pages: {maxPages}</Label>
                  </div>
                  <Slider
                    id="maxPages"
                    min={1}
                    max={50}
                    step={1}
                    value={maxPages}
                    onValueChange={setMaxPages}
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="tableOfContents"
                      checked={includeTableOfContents}
                      onCheckedChange={setIncludeTableOfContents}
                      disabled={isGenerating}
                    />
                    <Label htmlFor="tableOfContents">Include table of contents</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="executiveSummary"
                      checked={includeExecutiveSummary}
                      onCheckedChange={setIncludeExecutiveSummary}
                      disabled={isGenerating}
                    />
                    <Label htmlFor="executiveSummary">Include executive summary</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="rawData"
                      checked={includeRawData}
                      onCheckedChange={setIncludeRawData}
                      disabled={isGenerating}
                    />
                    <Label htmlFor="rawData">Include raw data appendix</Label>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Collapsible open={isProgressExpanded} onOpenChange={setIsProgressExpanded} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Report Generation Progress</h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {isProgressExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("configure")}
                      disabled={isGenerating}
                    >
                      Edit Configuration
                    </Button>

                    {isComplete && (
                      <Button variant="outline" size="sm" onClick={handleRegenerate}>
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Regenerate
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {isComplete ? (
                      <span className="text-sm text-green-600 flex items-center">
                        <Check className="mr-1 h-4 w-4" /> Complete
                      </span>
                    ) : isGenerating ? (
                      <span className="text-sm text-blue-600 flex items-center">
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Processing
                      </span>
                    ) : (
                      <span className="text-sm text-red-600 flex items-center">
                        <X className="mr-1 h-4 w-4" /> Stopped
                      </span>
                    )}
                  </div>
                </div>

                <AgentStepVisualizer steps={reportSteps} />
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {previewData && <ReportPreview data={previewData} />}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onClose && (
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
        )}
        <div className="flex space-x-2">
          {activeTab === "preview" && isComplete ? (
            <>
              <Button variant="outline" onClick={() => setActiveTab("progress")}>
                View Progress
              </Button>
              <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download {format.toUpperCase()}
              </Button>
            </>
          ) : activeTab === "progress" && isComplete ? (
            <>
              <Button variant="outline" onClick={() => setActiveTab("configure")}>
                Edit
              </Button>
              <Button onClick={() => setActiveTab("preview")} className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </>
          ) : activeTab === "configure" ? (
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim() || !title.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  )
}

