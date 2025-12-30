import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Plus, Menu, Loader2, Trash2, GraduationCap, Plane, Globe, Briefcase, Building } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppNavigation } from "@/hooks/useAppNavigation";

interface TrainingInformationProps {
    language: 'bn' | 'en';
}

const translations = {
    bn: {
        title: "প্রশিক্ষণ ও বিদেশ সংক্রান্ত তথ্য",
        dashboard: "ড্যাশবোর্ড",
        breadcrumb: "প্রশিক্ষণ তথ্য",
        description: "*প্রশিক্ষণ, বিদেশ ভ্রমণ, পোস্টিং এবং লিয়েন/প্রেষণ সংক্রান্ত সকল তথ্য এখানে প্রদান করুন।",

        // Tab titles
        domesticTraining: "দেশে প্রশিক্ষণ",
        foreignTraining: "বৈদেশিক প্রশিক্ষণ",
        foreignTravel: "বিদেশ ভ্রমণ",
        foreignPosting: "বিদেশ পোস্টিং",
        lienDeputation: "লিয়েন/প্রেষণ",

        // Common fields
        serialNo: "ক্রমিক নং",
        courseName: "কোর্সের নাম",
        courseNamePlaceholder: "কোর্সের নাম লিখুন",
        institutionName: "প্রশিক্ষণ প্রতিষ্ঠানের নাম",
        institutionNamePlaceholder: "প্রতিষ্ঠানের নাম লিখুন",
        duration: "সময়কাল",
        durationPlaceholder: "যেমন: ০১/০১/২০২০ - ৩১/১২/২০২০",
        fundingSource: "অর্থায়নের উৎস",
        fundingSourcePlaceholder: "অর্থায়নের উৎস লিখুন",
        country: "দেশের নাম",
        countryPlaceholder: "দেশ নির্বাচন করুন",

        // Foreign travel specific
        travelPurpose: "ভ্রমণের উদ্দেশ্য",
        travelPurposePlaceholder: "উদ্দেশ্য নির্বাচন করুন",
        workshop: "ওয়ার্কশপ",
        seminar: "সেমিনার",
        studyTour: "শিক্ষা সফর",
        otherPurpose: "অন্যান্য",

        // Posting/Lien specific
        designation: "পদবি",
        designationPlaceholder: "পদবি লিখুন",

        // Action buttons
        add: "নতুন যোগ করুন",
        remove: "মুছে ফেলুন",
        save: "সংরক্ষণ করুন",
        saving: "সংরক্ষণ হচ্ছে...",
        edit: "সম্পাদনা করুন",
        cancel: "বাতিল",

        // Messages
        noData: "কোন তথ্য যোগ করা হয়নি",
        addFirst: "প্রথম তথ্য যোগ করতে উপরের বাটনে ক্লিক করুন",
        success: "সফলভাবে সংরক্ষিত হয়েছে",
        successDesc: "প্রশিক্ষণ তথ্য সফলভাবে সংরক্ষিত হয়েছে",
        error: "ত্রুটি",
        errorDesc: "তথ্য সংরক্ষণ করতে সমস্যা হয়েছে",

        // Funding sources
        govtFunding: "সরকারি",
        selfFunding: "নিজস্ব",
        foreignFunding: "বৈদেশিক",
        organizationFunding: "প্রতিষ্ঠান",
    },
    en: {
        title: "Training & Foreign Information",
        dashboard: "Dashboard",
        breadcrumb: "Training Information",
        description: "*Please provide all information related to training, foreign travel, posting and lien/deputation here.",

        // Tab titles
        domesticTraining: "Domestic Training",
        foreignTraining: "Foreign Training",
        foreignTravel: "Foreign Travel",
        foreignPosting: "Foreign Posting",
        lienDeputation: "Lien/Deputation",

        // Common fields
        serialNo: "Sl. No.",
        courseName: "Course Name",
        courseNamePlaceholder: "Enter course name",
        institutionName: "Training Institution Name",
        institutionNamePlaceholder: "Enter institution name",
        duration: "Duration",
        durationPlaceholder: "e.g., 01/01/2020 - 31/12/2020",
        fundingSource: "Funding Source",
        fundingSourcePlaceholder: "Enter funding source",
        country: "Country Name",
        countryPlaceholder: "Select country",

        // Foreign travel specific
        travelPurpose: "Purpose of Travel",
        travelPurposePlaceholder: "Select purpose",
        workshop: "Workshop",
        seminar: "Seminar",
        studyTour: "Study Tour",
        otherPurpose: "Others",

        // Posting/Lien specific
        designation: "Designation",
        designationPlaceholder: "Enter designation",

        // Action buttons
        add: "Add New",
        remove: "Remove",
        save: "Save",
        saving: "Saving...",
        edit: "Edit",
        cancel: "Cancel",

        // Messages
        noData: "No data added",
        addFirst: "Click the button above to add the first entry",
        success: "Successfully Saved",
        successDesc: "Training information has been saved successfully",
        error: "Error",
        errorDesc: "Failed to save information",

        // Funding sources
        govtFunding: "Government",
        selfFunding: "Self",
        foreignFunding: "Foreign",
        organizationFunding: "Organization",
    },
};

// Common countries list
const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France",
    "Japan", "China", "India", "South Korea", "Singapore", "Malaysia", "Thailand",
    "Indonesia", "Saudi Arabia", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman",
    "Turkey", "Russia", "Italy", "Spain", "Netherlands", "Belgium", "Switzerland",
    "Sweden", "Norway", "Denmark", "Finland", "Austria", "Poland", "Brazil",
    "Mexico", "Argentina", "South Africa", "Egypt", "Nigeria", "Kenya",
];

// Zod schemas
const domesticTrainingSchema = z.object({
    courseName: z.string().min(1, "Course name is required"),
    institutionName: z.string().min(1, "Institution name is required"),
    duration: z.string().min(1, "Duration is required"),
    fundingSource: z.string().min(1, "Funding source is required"),
});

const foreignTrainingSchema = z.object({
    courseName: z.string().min(1, "Course name is required"),
    institutionName: z.string().min(1, "Institution name is required"),
    country: z.string().min(1, "Country is required"),
    duration: z.string().min(1, "Duration is required"),
    fundingSource: z.string().min(1, "Funding source is required"),
});

const foreignTravelSchema = z.object({
    purpose: z.string().min(1, "Purpose is required"),
    duration: z.string().min(1, "Duration is required"),
    country: z.string().min(1, "Country is required"),
});

const foreignPostingSchema = z.object({
    designation: z.string().min(1, "Designation is required"),
    institutionName: z.string().min(1, "Institution name is required"),
    country: z.string().min(1, "Country is required"),
    duration: z.string().min(1, "Duration is required"),
    fundingSource: z.string().min(1, "Funding source is required"),
});

const lienDeputationSchema = z.object({
    designation: z.string().min(1, "Designation is required"),
    institutionName: z.string().min(1, "Institution name is required"),
    country: z.string().min(1, "Country is required"),
    duration: z.string().min(1, "Duration is required"),
    fundingSource: z.string().min(1, "Funding source is required"),
});

const formSchema = z.object({
    domesticTrainings: z.array(domesticTrainingSchema).optional(),
    foreignTrainings: z.array(foreignTrainingSchema).optional(),
    foreignTravels: z.array(foreignTravelSchema).optional(),
    foreignPostings: z.array(foreignPostingSchema).optional(),
    lienDeputations: z.array(lienDeputationSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TrainingInformation = ({ language: initialLanguage }: TrainingInformationProps) => {
    const [language, setLanguage] = useState<'bn' | 'en'>(initialLanguage);
    const t = translations[language];
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(true);
    const [activeTab, setActiveTab] = useState("domesticTraining");
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            domesticTrainings: [],
            foreignTrainings: [],
            foreignTravels: [],
            foreignPostings: [],
            lienDeputations: [],
        },
        mode: "onChange",
    });

    const { control, handleSubmit, reset } = form;

    // Field arrays for each section
    const domesticTrainings = useFieldArray({ control, name: "domesticTrainings" });
    const foreignTrainings = useFieldArray({ control, name: "foreignTrainings" });
    const foreignTravels = useFieldArray({ control, name: "foreignTravels" });
    const foreignPostings = useFieldArray({ control, name: "foreignPostings" });
    const lienDeputations = useFieldArray({ control, name: "lienDeputations" });

    // Fetch all training data
    const { data: trainingData, isLoading } = useQuery({
        queryKey: ['training-information', user?.id],
        queryFn: async () => {
            if (!user?.id) throw new Error('User not authenticated');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sb = supabase as any;
            const [
                domesticRes,
                foreignTrainingRes,
                foreignTravelRes,
                foreignPostingRes,
                lienDeputationRes
            ] = await Promise.all([
                sb.from('domestic_trainings').select('*').eq('user_id', user.id),
                sb.from('foreign_trainings').select('*').eq('user_id', user.id),
                sb.from('foreign_travels').select('*').eq('user_id', user.id),
                sb.from('foreign_postings').select('*').eq('user_id', user.id),
                sb.from('lien_deputations').select('*').eq('user_id', user.id),
            ]);

            return {
                domesticTrainings: domesticRes.data || [],
                foreignTrainings: foreignTrainingRes.data || [],
                foreignTravels: foreignTravelRes.data || [],
                foreignPostings: foreignPostingRes.data || [],
                lienDeputations: lienDeputationRes.data || [],
            };
        },
        enabled: !!user?.id,
    });

    // Populate form with fetched data and set editing mode
    useEffect(() => {
        if (trainingData) {
            const hasData =
                trainingData.domesticTrainings.length > 0 ||
                trainingData.foreignTrainings.length > 0 ||
                trainingData.foreignTravels.length > 0 ||
                trainingData.foreignPostings.length > 0 ||
                trainingData.lienDeputations.length > 0;

            // If there's existing data, start in view mode; otherwise start in edit mode
            setIsEditing(!hasData);

            reset({
                domesticTrainings: trainingData.domesticTrainings.map((item: { course_name: string; institution_name: string; duration: string; funding_source: string }) => ({
                    courseName: item.course_name,
                    institutionName: item.institution_name,
                    duration: item.duration,
                    fundingSource: item.funding_source,
                })),
                foreignTrainings: trainingData.foreignTrainings.map((item: { course_name: string; institution_name: string; country: string; duration: string; funding_source: string }) => ({
                    courseName: item.course_name,
                    institutionName: item.institution_name,
                    country: item.country,
                    duration: item.duration,
                    fundingSource: item.funding_source,
                })),
                foreignTravels: trainingData.foreignTravels.map((item: { purpose: string; duration: string; country: string }) => ({
                    purpose: item.purpose,
                    duration: item.duration,
                    country: item.country,
                })),
                foreignPostings: trainingData.foreignPostings.map((item: { designation: string; institution_name: string; country: string; duration: string; funding_source: string }) => ({
                    designation: item.designation,
                    institutionName: item.institution_name,
                    country: item.country,
                    duration: item.duration,
                    fundingSource: item.funding_source,
                })),
                lienDeputations: trainingData.lienDeputations.map((item: { designation: string; institution_name: string; country: string; duration: string; funding_source: string }) => ({
                    designation: item.designation,
                    institutionName: item.institution_name,
                    country: item.country,
                    duration: item.duration,
                    fundingSource: item.funding_source,
                })),
            });
        }
    }, [trainingData, reset]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async (data: FormValues) => {
            if (!user?.id) throw new Error('User not authenticated');

            // Delete existing records and insert new ones for each table
            const operations = [];

            // Domestic Trainings
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            operations.push(
                (supabase as any).from('domestic_trainings').delete().eq('user_id', user.id)
            );
            if (data.domesticTrainings && data.domesticTrainings.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                operations.push(
                    (supabase as any).from('domestic_trainings').insert(
                        data.domesticTrainings.map(item => ({
                            user_id: user.id,
                            course_name: item.courseName,
                            institution_name: item.institutionName,
                            duration: item.duration,
                            funding_source: item.fundingSource,
                        }))
                    )
                );
            }

            // Foreign Trainings
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            operations.push(
                (supabase as any).from('foreign_trainings').delete().eq('user_id', user.id)
            );
            if (data.foreignTrainings && data.foreignTrainings.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                operations.push(
                    (supabase as any).from('foreign_trainings').insert(
                        data.foreignTrainings.map(item => ({
                            user_id: user.id,
                            course_name: item.courseName,
                            institution_name: item.institutionName,
                            country: item.country,
                            duration: item.duration,
                            funding_source: item.fundingSource,
                        }))
                    )
                );
            }

            // Foreign Travels
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            operations.push(
                (supabase as any).from('foreign_travels').delete().eq('user_id', user.id)
            );
            if (data.foreignTravels && data.foreignTravels.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                operations.push(
                    (supabase as any).from('foreign_travels').insert(
                        data.foreignTravels.map(item => ({
                            user_id: user.id,
                            purpose: item.purpose,
                            duration: item.duration,
                            country: item.country,
                        }))
                    )
                );
            }

            // Foreign Postings
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            operations.push(
                (supabase as any).from('foreign_postings').delete().eq('user_id', user.id)
            );
            if (data.foreignPostings && data.foreignPostings.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                operations.push(
                    (supabase as any).from('foreign_postings').insert(
                        data.foreignPostings.map(item => ({
                            user_id: user.id,
                            designation: item.designation,
                            institution_name: item.institutionName,
                            country: item.country,
                            duration: item.duration,
                            funding_source: item.fundingSource,
                        }))
                    )
                );
            }

            // Lien/Deputations
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            operations.push(
                (supabase as any).from('lien_deputations').delete().eq('user_id', user.id)
            );
            if (data.lienDeputations && data.lienDeputations.length > 0) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                operations.push(
                    (supabase as any).from('lien_deputations').insert(
                        data.lienDeputations.map(item => ({
                            user_id: user.id,
                            designation: item.designation,
                            institution_name: item.institutionName,
                            country: item.country,
                            duration: item.duration,
                            funding_source: item.fundingSource,
                        }))
                    )
                );
            }

            // Execute all operations
            const results = await Promise.all(operations);

            // Check for errors
            for (const result of results) {
                if (result.error) {
                    throw result.error;
                }
            }

            return true;
        },
        onSuccess: () => {
            toast({
                title: t.success,
                description: t.successDesc,
            });
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['training-information', user?.id] });
        },
        onError: (error: Error) => {
            toast({
                title: t.error,
                description: error.message || t.errorDesc,
                variant: "destructive",
            });
        },
    });

    const { handleNavigate: appNavigate } = useAppNavigation();
    const handleNavigate = (section: string) => appNavigate(section, language);

    const handleLanguageChange = (newLanguage: 'bn' | 'en') => {
        setLanguage(newLanguage);
    };

    const onSubmit = async (data: FormValues) => {
        if (!user) return;
        saveMutation.mutate(data);
    };

    // Empty state component
    const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="rounded-full bg-muted p-4 mb-4">
                <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground mb-2">{t.noData}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t.addFirst}</p>
            <Button onClick={onAdd} variant="outline" disabled={!isEditing}>
                <Plus className="h-4 w-4 mr-2" />
                {t.add}
            </Button>
        </div>
    );



    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar language={language} onNavigate={handleNavigate} />
                <div className="flex-1 flex flex-col">
                    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                        <div className="flex items-center">
                            <SidebarTrigger className="p-2 h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                                <Menu className="h-5 w-5" />
                            </SidebarTrigger>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/">{t.dashboard}</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{t.breadcrumb}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <LanguageToggle onLanguageChange={handleLanguageChange} currentLanguage={language} />
                        <ThemeToggle />
                    </header>

                    <main className="flex-1 p-6 overflow-auto">
                        <CardHeader className="px-0">
                            <CardTitle>{t.title}</CardTitle>
                            <CardDescription className="text-red-700 font-extrabold text-base">
                                {t.description}
                            </CardDescription>
                        </CardHeader>

                        <div className="max-w-7xl mx-auto">
                            <Card>
                                <CardContent className="pt-6">
                                    <Form {...form}>
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                                <TabsList className="grid w-full grid-cols-5 mb-6">
                                                    <TabsTrigger value="domesticTraining" className="flex items-center gap-2">
                                                        <GraduationCap className="h-4 w-4" />
                                                        <span className="hidden sm:inline">{t.domesticTraining}</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="foreignTraining" className="flex items-center gap-2">
                                                        <Globe className="h-4 w-4" />
                                                        <span className="hidden sm:inline">{t.foreignTraining}</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="foreignTravel" className="flex items-center gap-2">
                                                        <Plane className="h-4 w-4" />
                                                        <span className="hidden sm:inline">{t.foreignTravel}</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="foreignPosting" className="flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4" />
                                                        <span className="hidden sm:inline">{t.foreignPosting}</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="lienDeputation" className="flex items-center gap-2">
                                                        <Building className="h-4 w-4" />
                                                        <span className="hidden sm:inline">{t.lienDeputation}</span>
                                                    </TabsTrigger>
                                                </TabsList>

                                                {/* Domestic Training Tab */}
                                                <TabsContent value="domesticTraining" className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-lg font-semibold">{t.domesticTraining}</h3>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!isEditing}
                                                            onClick={() => domesticTrainings.append({
                                                                courseName: "",
                                                                institutionName: "",
                                                                duration: "",
                                                                fundingSource: "",
                                                            })}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            {t.add}
                                                        </Button>
                                                    </div>

                                                    {domesticTrainings.fields.length === 0 ? (
                                                        <EmptyState onAdd={() => domesticTrainings.append({
                                                            courseName: "",
                                                            institutionName: "",
                                                            duration: "",
                                                            fundingSource: "",
                                                        })} />
                                                    ) : (
                                                        domesticTrainings.fields.map((field, index) => (
                                                            <Card key={field.id} className="p-4 relative">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 hover:bg-red-100"
                                                                    disabled={!isEditing}
                                                                    onClick={() => domesticTrainings.remove(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-700" />
                                                                </Button>
                                                                <div className="text-sm text-muted-foreground mb-3">
                                                                    {t.serialNo}: {index + 1}
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <FormField
                                                                        control={control}
                                                                        name={`domesticTrainings.${index}.courseName`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.courseName} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.courseNamePlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`domesticTrainings.${index}.institutionName`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.institutionName} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.institutionNamePlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`domesticTrainings.${index}.duration`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.duration} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.durationPlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`domesticTrainings.${index}.fundingSource`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.fundingSource} *</FormLabel>
                                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger>
                                                                                            <SelectValue placeholder={t.fundingSourcePlaceholder} />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="govt">{t.govtFunding}</SelectItem>
                                                                                        <SelectItem value="self">{t.selfFunding}</SelectItem>
                                                                                        <SelectItem value="foreign">{t.foreignFunding}</SelectItem>
                                                                                        <SelectItem value="organization">{t.organizationFunding}</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </Card>
                                                        ))
                                                    )}
                                                </TabsContent>

                                                {/* Foreign Training Tab */}
                                                <TabsContent value="foreignTraining" className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-lg font-semibold">{t.foreignTraining}</h3>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!isEditing}
                                                            onClick={() => foreignTrainings.append({
                                                                courseName: "",
                                                                institutionName: "",
                                                                country: "",
                                                                duration: "",
                                                                fundingSource: "",
                                                            })}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            {t.add}
                                                        </Button>
                                                    </div>

                                                    {foreignTrainings.fields.length === 0 ? (
                                                        <EmptyState onAdd={() => foreignTrainings.append({
                                                            courseName: "",
                                                            institutionName: "",
                                                            country: "",
                                                            duration: "",
                                                            fundingSource: "",
                                                        })} />
                                                    ) : (
                                                        foreignTrainings.fields.map((field, index) => (
                                                            <Card key={field.id} className="p-4 relative">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 hover:bg-red-100"
                                                                    disabled={!isEditing}
                                                                    onClick={() => foreignTrainings.remove(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-700" />
                                                                </Button>
                                                                <div className="text-sm text-muted-foreground mb-3">
                                                                    {t.serialNo}: {index + 1}
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignTrainings.${index}.courseName`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.courseName} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.courseNamePlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignTrainings.${index}.institutionName`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.institutionName} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.institutionNamePlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignTrainings.${index}.country`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.country} *</FormLabel>
                                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger>
                                                                                            <SelectValue placeholder={t.countryPlaceholder} />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        {countries.map((country) => (
                                                                                            <SelectItem key={country} value={country}>
                                                                                                {country}
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignTrainings.${index}.duration`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.duration} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.durationPlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignTrainings.${index}.fundingSource`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="md:col-span-2">
                                                                                <FormLabel>{t.fundingSource} *</FormLabel>
                                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger>
                                                                                            <SelectValue placeholder={t.fundingSourcePlaceholder} />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="govt">{t.govtFunding}</SelectItem>
                                                                                        <SelectItem value="self">{t.selfFunding}</SelectItem>
                                                                                        <SelectItem value="foreign">{t.foreignFunding}</SelectItem>
                                                                                        <SelectItem value="organization">{t.organizationFunding}</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </Card>
                                                        ))
                                                    )}
                                                </TabsContent>

                                                {/* Foreign Travel Tab */}
                                                <TabsContent value="foreignTravel" className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-lg font-semibold">{t.foreignTravel}</h3>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!isEditing}
                                                            onClick={() => foreignTravels.append({
                                                                purpose: "",
                                                                duration: "",
                                                                country: "",
                                                            })}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            {t.add}
                                                        </Button>
                                                    </div>

                                                    {foreignTravels.fields.length === 0 ? (
                                                        <EmptyState onAdd={() => foreignTravels.append({
                                                            purpose: "",
                                                            duration: "",
                                                            country: "",
                                                        })} />
                                                    ) : (
                                                        foreignTravels.fields.map((field, index) => (
                                                            <Card key={field.id} className="p-4 relative">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 hover:bg-red-100"
                                                                    disabled={!isEditing}
                                                                    onClick={() => foreignTravels.remove(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-700" />
                                                                </Button>
                                                                <div className="text-sm text-muted-foreground mb-3">
                                                                    {t.serialNo}: {index + 1}
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignTravels.${index}.purpose`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.travelPurpose} *</FormLabel>
                                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger>
                                                                                            <SelectValue placeholder={t.travelPurposePlaceholder} />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="workshop">{t.workshop}</SelectItem>
                                                                                        <SelectItem value="seminar">{t.seminar}</SelectItem>
                                                                                        <SelectItem value="studyTour">{t.studyTour}</SelectItem>
                                                                                        <SelectItem value="other">{t.otherPurpose}</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignTravels.${index}.duration`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.duration} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.durationPlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignTravels.${index}.country`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.country} *</FormLabel>
                                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger>
                                                                                            <SelectValue placeholder={t.countryPlaceholder} />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        {countries.map((country) => (
                                                                                            <SelectItem key={country} value={country}>
                                                                                                {country}
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </Card>
                                                        ))
                                                    )}
                                                </TabsContent>

                                                {/* Foreign Posting Tab */}
                                                <TabsContent value="foreignPosting" className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-lg font-semibold">{t.foreignPosting}</h3>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!isEditing}
                                                            onClick={() => foreignPostings.append({
                                                                designation: "",
                                                                institutionName: "",
                                                                country: "",
                                                                duration: "",
                                                                fundingSource: "",
                                                            })}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            {t.add}
                                                        </Button>
                                                    </div>

                                                    {foreignPostings.fields.length === 0 ? (
                                                        <EmptyState onAdd={() => foreignPostings.append({
                                                            designation: "",
                                                            institutionName: "",
                                                            country: "",
                                                            duration: "",
                                                            fundingSource: "",
                                                        })} />
                                                    ) : (
                                                        foreignPostings.fields.map((field, index) => (
                                                            <Card key={field.id} className="p-4 relative">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 hover:bg-red-100"
                                                                    disabled={!isEditing}
                                                                    onClick={() => foreignPostings.remove(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-700" />
                                                                </Button>
                                                                <div className="text-sm text-muted-foreground mb-3">
                                                                    {t.serialNo}: {index + 1}
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignPostings.${index}.designation`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.designation} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.designationPlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignPostings.${index}.institutionName`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.institutionName} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.institutionNamePlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignPostings.${index}.country`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.country} *</FormLabel>
                                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger>
                                                                                            <SelectValue placeholder={t.countryPlaceholder} />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        {countries.map((country) => (
                                                                                            <SelectItem key={country} value={country}>
                                                                                                {country}
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignPostings.${index}.duration`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.duration} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.durationPlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`foreignPostings.${index}.fundingSource`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="md:col-span-2">
                                                                                <FormLabel>{t.fundingSource} *</FormLabel>
                                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger>
                                                                                            <SelectValue placeholder={t.fundingSourcePlaceholder} />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="govt">{t.govtFunding}</SelectItem>
                                                                                        <SelectItem value="self">{t.selfFunding}</SelectItem>
                                                                                        <SelectItem value="foreign">{t.foreignFunding}</SelectItem>
                                                                                        <SelectItem value="organization">{t.organizationFunding}</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </Card>
                                                        ))
                                                    )}
                                                </TabsContent>

                                                {/* Lien/Deputation Tab */}
                                                <TabsContent value="lienDeputation" className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-lg font-semibold">{t.lienDeputation}</h3>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!isEditing}
                                                            onClick={() => lienDeputations.append({
                                                                designation: "",
                                                                institutionName: "",
                                                                country: "",
                                                                duration: "",
                                                                fundingSource: "",
                                                            })}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            {t.add}
                                                        </Button>
                                                    </div>

                                                    {lienDeputations.fields.length === 0 ? (
                                                        <EmptyState onAdd={() => lienDeputations.append({
                                                            designation: "",
                                                            institutionName: "",
                                                            country: "",
                                                            duration: "",
                                                            fundingSource: "",
                                                        })} />
                                                    ) : (
                                                        lienDeputations.fields.map((field, index) => (
                                                            <Card key={field.id} className="p-4 relative">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="absolute top-2 right-2 hover:bg-red-100"
                                                                    disabled={!isEditing}
                                                                    onClick={() => lienDeputations.remove(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-700" />
                                                                </Button>
                                                                <div className="text-sm text-muted-foreground mb-3">
                                                                    {t.serialNo}: {index + 1}
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <FormField
                                                                        control={control}
                                                                        name={`lienDeputations.${index}.designation`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.designation} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.designationPlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`lienDeputations.${index}.institutionName`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.institutionName} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.institutionNamePlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`lienDeputations.${index}.country`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.country} *</FormLabel>
                                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger>
                                                                                            <SelectValue placeholder={t.countryPlaceholder} />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        {countries.map((country) => (
                                                                                            <SelectItem key={country} value={country}>
                                                                                                {country}
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`lienDeputations.${index}.duration`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.duration} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.durationPlaceholder} {...field} disabled={!isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={control}
                                                                        name={`lienDeputations.${index}.fundingSource`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="md:col-span-2">
                                                                                <FormLabel>{t.fundingSource} *</FormLabel>
                                                                                <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger>
                                                                                            <SelectValue placeholder={t.fundingSourcePlaceholder} />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="govt">{t.govtFunding}</SelectItem>
                                                                                        <SelectItem value="self">{t.selfFunding}</SelectItem>
                                                                                        <SelectItem value="foreign">{t.foreignFunding}</SelectItem>
                                                                                        <SelectItem value="organization">{t.organizationFunding}</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </Card>
                                                        ))
                                                    )}
                                                </TabsContent>
                                            </Tabs>

                                            {/* Submit Button */}
                                            <div className="flex justify-end gap-4 pt-6 border-t">
                                                {!isEditing ? (
                                                    <Button type="button" onClick={() => setIsEditing(true)}>
                                                        {t.edit}
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                                            {t.cancel}
                                                        </Button>
                                                        <Button type="submit" disabled={saveMutation.isPending}>
                                                            {saveMutation.isPending ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    {t.saving}
                                                                </>
                                                            ) : (
                                                                t.save
                                                            )}
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default TrainingInformation;
