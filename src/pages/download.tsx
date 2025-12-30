import { useState, useEffect, useRef } from "react";
import { Download, Menu, Bell, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Breadcrumbs from "@/components/ui/breadcrumb";
import { useAppNavigation } from "@/hooks/useAppNavigation";

interface DownloadProps {
    language: 'bn' | 'en';
}

// i18n translations
const translations = {
    bn: {
        pageTitle: "ডাউনলোড",
        downloadBtn: "পিডিএফ ডাউনলোড করুন",
        printBtn: "প্রিন্ট করুন",
        annexure: "সংযোজনী-১০",
        title: "গেজেটেড সরকারি কর্মচারীগণের ই-চাকরি বৃত্তান্ত",
        subtitle: "(কর্মকর্তাগণের জন্য)",
        section1: "দাপ্তরিক তথ্যাবলি:",
        section2: "সাধারণ তথ্যাবলি:",
        section3: "বৈবাহিক অবস্থা:",
        section4: "ছেলে/মেয়েদের জন্য:",
        section5: "শিক্ষাগত যোগ্যতা:",
        // Section 1 fields
        s1_a: "(ক) মন্ত্রণালয়/বিভাগ",
        s1_b: "(খ) অধিদপ্তর/পরিদপ্তর/দপ্তরের নাম",
        s1_c: "(গ) সরকারি কর্মচারীর পরিচিতি নম্বর (যদি থাকে)",
        s1_d: "(ঘ) সরকারি কর্মচারীর জাতীয় পরিচয় নম্বর",
        s1_e: "(ঙ) সরকারি কর্মচারীর টিআইএন (যদি থাকে)",
        s1_f: "(চ) জন্ম স্থান",
        s1_f_village: "গ্রাম/ওয়ার্ড",
        s1_f_upazila: "উপজেলা/থানা",
        s1_f_district: "জেলা",
        // Section 2 fields
        s2_a: "(ক) নাম",
        s2_b: "(খ) জন্ম তারিখ",
        s2_c: "(গ) পিতার নাম",
        s2_d: "(ঘ) মাতার নাম",
        s2_e: "(ঙ) স্থায়ী ঠিকানা",
        s2_f: "(চ) বর্তমান ঠিকানা",
        s2_g: "(ছ) নিজ জেলা",
        s2_h: "(জ) সরকারি চাকরিতে যোগদানের তারিখ",
        s2_i: "(ঝ) বর্তমান পদে যোগদানের তারিখ",
        s2_j: "(ঞ) বর্তমান পদবি, কর্মস্থলের ঠিকানা ও ফোন নম্বর:",
        s2_k: "(ট) চাকরি স্থায়ীকরণের সরকারি আদেশ নং ও তারিখ:",
        s2_l: "(ঠ) রক্তের গ্রুপ",
        s2_m: "(ড) বিশেষ কোন রোগে ভুগিলে তাহার তথ্য",
        s2_n: "(ঢ) ফোন নম্বর",
        s2_n_mobile: "মোবাইল ফোন:",
        s2_n_email: "ই-মেইল",
        // Section 3 fields
        s3_a: "(ক) বিবাহিত/অবিবাহিত/বিধবা/তালাকপ্রাপ্ত/বিপত্নীক",
        s3_b: "(খ) স্বামী/স্ত্রীর নাম",
        s3_c: "(গ) স্বামী/স্ত্রীর পেশা",
        s3_d: "(ঘ) স্বামী/স্ত্রীর জাতীয় পরিচয় নম্বর",
        s3_e: "(ঙ) স্বামী/স্ত্রীর টিআইএন (যদি থাকে)",
        s3_f: "(চ) স্বামী/স্ত্রীর নিজ জেলা",
        s3_g: "(ছ) স্বামী/স্ত্রী সরকারি কর্মকর্তা/কর্মচারী হইলে পরিচিতি নম্বর:",
        s3_h: "(জ) স্বামী/স্ত্রী সরকারি কর্মকর্তা/কর্মচারী হইলে বর্তমান পদবি ও অফিসের ঠিকানা এবং ফোন নম্বর",
        s3_i: "(ঝ) একাধিক স্ত্রী থাকিলে তাহাদের নাম ও ঠিকানা:",
        // Section 4 table headers
        s4_serial: "ক্র. নং",
        s4_name: "নাম",
        s4_dob: "জন্ম তারিখ",
        s4_gender: "ছেলে/মেয়ে",
        s4_age: "বয়স",
        s4_marital: "বিবাহিত/অবিবাহিত",
        s4_special: "বিশেষ/প্রতিবন্ধী স্থান",
        // Section 5 table headers
        s5_serial: "ক্র. নং",
        s5_degree: "ডিগ্রীর নাম",
        s5_institution: "শিক্ষা প্রতিষ্ঠানের নাম",
        s5_board: "বোর্ড/বিশ্ববিদ্যালয় নাম",
        s5_subject: "বিষয়",
        s5_year: "পাশের সন",
        s5_division: "ব্রাঞ্চ/ডিভিশন/শ্রেণী",
        // Marital status options
        married: "বিবাহিত",
        unmarried: "অবিবাহিত",
        widow: "বিধবা",
        divorced: "তালাকপ্রাপ্ত",
        widower: "বিপত্নীক",
        // Gender
        male: "ছেলে",
        female: "মেয়ে",
        page: "পৃষ্ঠা",
        // Section 6: Training & Foreign Information
        section6: "দেশে প্রশিক্ষণ:",
        s6a_title: "(ক) দেশে প্রশিক্ষণ:",
        s6a_serial: "ক্র: নং",
        s6a_course: "কোর্সের নাম",
        s6a_institution: "প্রশিক্ষণ প্রতিষ্ঠানের নাম",
        s6a_duration: "প্রশিক্ষণের সময়কাল",
        s6a_funding: "অর্থায়নের উৎস",
        s6b_title: "(খ) বৈদেশিক প্রশিক্ষণ:",
        s6b_institution_country: "প্রশিক্ষণ প্রতিষ্ঠানের ও দেশের নাম",
        s6c_title: "(গ) বিদেশ ভ্রমণ সংক্রান্ত তথ্য:",
        s6c_purpose: "ভ্রমণের উদ্দেশ্য (ওয়ার্কশপ/সেমিনার/শিক্ষা সফর/অন্যান্য)",
        s6c_duration: "সময়কাল",
        s6c_country: "দেশ",
        s6d_title: "(ঘ) বিদেশ পোস্টিং:",
        s6d_designation: "পদবি",
        s6d_institution: "প্রতিষ্ঠানের নাম",
        s6d_country: "দেশের নাম",
        s6d_duration: "সময়কাল",
        s6d_funding: "অর্থায়নের উৎস",
        s6e_title: "(ঙ) লিয়েন/প্রেষণ:",
        noData: "কোন তথ্য নেই",
    },
    en: {
        pageTitle: "Download",
        downloadBtn: "Download PDF",
        printBtn: "Print",
        annexure: "Annexure-10",
        title: "Gazetted Government Employees' E-Job Biography",
        subtitle: "(For Officers)",
        section1: "Official Information:",
        section2: "General Information:",
        section3: "Marital Status:",
        section4: "Children Information:",
        section5: "Educational Qualification:",
        // Section 1 fields
        s1_a: "(a) Ministry/Division",
        s1_b: "(b) Directorate/Department Name",
        s1_c: "(c) Government Employee ID (if any)",
        s1_d: "(d) National ID Number",
        s1_e: "(e) TIN (if any)",
        s1_f: "(f) Birth Place",
        s1_f_village: "Village/Ward",
        s1_f_upazila: "Upazila/Thana",
        s1_f_district: "District",
        // Section 2 fields
        s2_a: "(a) Name",
        s2_b: "(b) Date of Birth",
        s2_c: "(c) Father's Name",
        s2_d: "(d) Mother's Name",
        s2_e: "(e) Permanent Address",
        s2_f: "(f) Present Address",
        s2_g: "(g) Home District",
        s2_h: "(h) Government Service Joining Date",
        s2_i: "(i) Current Position Joining Date",
        s2_j: "(j) Current Designation, Workplace Address & Phone:",
        s2_k: "(k) Confirmation Order No. & Date:",
        s2_l: "(l) Blood Group",
        s2_m: "(m) Special Illness Information",
        s2_n: "(n) Phone Number",
        s2_n_mobile: "Mobile:",
        s2_n_email: "Email",
        // Section 3 fields
        s3_a: "(a) Married/Unmarried/Widow/Divorced/Widower",
        s3_b: "(b) Spouse Name",
        s3_c: "(c) Spouse Occupation",
        s3_d: "(d) Spouse National ID",
        s3_e: "(e) Spouse TIN (if any)",
        s3_f: "(f) Spouse Home District",
        s3_g: "(g) Spouse Employee ID (if govt. employee):",
        s3_h: "(h) Spouse Designation, Office Address & Phone (if govt. employee)",
        s3_i: "(i) Multiple Spouses Name & Address:",
        // Section 4 table headers
        s4_serial: "Sl. No.",
        s4_name: "Name",
        s4_dob: "Date of Birth",
        s4_gender: "Gender",
        s4_age: "Age",
        s4_marital: "Marital Status",
        s4_special: "Special/Disabled",
        // Section 5 table headers
        s5_serial: "Sl. No.",
        s5_degree: "Degree Name",
        s5_institution: "Institution Name",
        s5_board: "Board/University",
        s5_subject: "Subject",
        s5_year: "Passing Year",
        s5_division: "Division/Class",
        // Marital status options
        married: "Married",
        unmarried: "Unmarried",
        widow: "Widow",
        divorced: "Divorced",
        widower: "Widower",
        // Gender
        male: "Male",
        female: "Female",
        page: "Page",
        // Section 6: Training & Foreign Information
        section6: "Domestic Training:",
        s6a_title: "(a) Domestic Training:",
        s6a_serial: "Sl. No.",
        s6a_course: "Course Name",
        s6a_institution: "Training Institution Name",
        s6a_duration: "Training Duration",
        s6a_funding: "Funding Source",
        s6b_title: "(b) Foreign Training:",
        s6b_institution_country: "Training Institution & Country Name",
        s6c_title: "(c) Foreign Travel Information:",
        s6c_purpose: "Purpose of Travel (Workshop/Seminar/Study Tour/Others)",
        s6c_duration: "Duration",
        s6c_country: "Country",
        s6d_title: "(d) Foreign Posting:",
        s6d_designation: "Designation",
        s6d_institution: "Institution Name",
        s6d_country: "Country Name",
        s6d_duration: "Duration",
        s6d_funding: "Funding Source",
        s6e_title: "(e) Lien/Deputation:",
        noData: "No data",
    }
};

// Types for data
interface ProfileData {
    full_name: string | null;
    date_of_birth: string | null;
    designation: string | null;
    address_line1: string | null;
    district: string | null;
    joining_date: string | null;
    phone: string | null;
    email: string | null;
}

interface OfficeData {
    ministry: string | null;
    directorate: string | null;
    identity_number: string | null;
    nid: string | null;
    tin: string | null;
    birth_place: string | null;
    village: string | null;
    upazila: string | null;
    district: string | null;
}

interface GeneralData {
    father_name: string | null;
    mother_name: string | null;
    current_address: string | null;
    current_position_joining_date: string | null;
    workplace_address: string | null;
    workplace_phone: string | null;
    confirmation_order_number: string | null;
    confirmation_order_date: string | null;
    blood_group: string | null;
    special_illness_info: string | null;
    mobile_phone: string | null;
}

interface MaritalData {
    marital_status: 'married' | 'unmarried' | 'widow' | 'divorced' | 'widower' | null;
}

interface SpouseData {
    name: string | null;
    occupation: string | null;
    nid: string | null;
    tin: string | null;
    district: string | null;
    employee_id: string | null;
    designation: string | null;
    office_address: string | null;
    office_phone: string | null;
}

interface ChildData {
    id: string;
    full_name: string | null;
    birth_date: string | null;
    gender: string | null;
    age: number | null;
    marital_status: string | null;
    special_status: string | null;
}

interface EducationData {
    id: string;
    degree_title: string | null;
    institution_name: string | null;
    board_university: string | null;
    subject: string | null;
    passing_year: number | null;
    result_division: string | null;
}

interface DomesticTrainingData {
    id: string;
    course_name: string | null;
    institution_name: string | null;
    duration: string | null;
    funding_source: string | null;
}

interface ForeignTrainingData {
    id: string;
    course_name: string | null;
    institution_name: string | null;
    country: string | null;
    duration: string | null;
    funding_source: string | null;
}

interface ForeignTravelData {
    id: string;
    purpose: string | null;
    duration: string | null;
    country: string | null;
}

interface ForeignPostingData {
    id: string;
    designation: string | null;
    institution_name: string | null;
    country: string | null;
    duration: string | null;
    funding_source: string | null;
}

interface LienDeputationData {
    id: string;
    designation: string | null;
    institution_name: string | null;
    country: string | null;
    duration: string | null;
    funding_source: string | null;
}

export default function DownloadPage({ language: initialLanguage }: DownloadProps) {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { signOut, user } = useAuth();
    const [language, setLanguage] = useState<'bn' | 'en'>(initialLanguage);
    const t = translations[language];
    const printRef = useRef<HTMLDivElement>(null);

    // Data states
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [office, setOffice] = useState<OfficeData | null>(null);
    const [general, setGeneral] = useState<GeneralData | null>(null);
    const [marital, setMarital] = useState<MaritalData | null>(null);
    const [spouses, setSpouses] = useState<SpouseData[]>([]);
    const [children, setChildren] = useState<ChildData[]>([]);
    const [education, setEducation] = useState<EducationData[]>([]);
    const [domesticTrainings, setDomesticTrainings] = useState<DomesticTrainingData[]>([]);
    const [foreignTrainings, setForeignTrainings] = useState<ForeignTrainingData[]>([]);
    const [foreignTravels, setForeignTravels] = useState<ForeignTravelData[]>([]);
    const [foreignPostings, setForeignPostings] = useState<ForeignPostingData[]>([]);
    const [lienDeputations, setLienDeputations] = useState<LienDeputationData[]>([]);

    // Fetch all data
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                setLoading(true);

                // Fetch profile
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name, date_of_birth, designation, address_line1, district, joining_date, phone, email')
                    .eq('id', user.id)
                    .single();
                setProfile(profileData);

                // Fetch office information
                const { data: officeData } = await supabase
                    .from('office_information')
                    .select('ministry, directorate, identity_number, nid, tin, birth_place, village, upazila, district')
                    .eq('user_id', user.id)
                    .maybeSingle();
                setOffice(officeData);

                // Fetch general information
                const { data: generalData } = await supabase
                    .from('general_information')
                    .select('father_name, mother_name, current_address, current_position_joining_date, workplace_address, workplace_phone, confirmation_order_number, confirmation_order_date, blood_group, special_illness_info, mobile_phone')
                    .eq('user_id', user.id)
                    .maybeSingle();
                setGeneral(generalData);

                // Fetch marital information with spouses
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: maritalData } = await (supabase as any)
                    .from('marital_information')
                    .select(`
            marital_status,
            spouse_information (
              name, occupation, nid, tin, district, employee_id, designation, office_address, office_phone
            )
          `)
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (maritalData) {
                    setMarital({ marital_status: maritalData.marital_status });
                    setSpouses(maritalData.spouse_information || []);
                }

                // Fetch children information
                const { data: childrenData } = await supabase
                    .from('children_information')
                    .select('id, full_name, birth_date, gender, age, marital_status, special_status')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });
                setChildren(childrenData || []);

                // Fetch educational qualifications
                const { data: educationData } = await supabase
                    .from('educational_qualifications')
                    .select('id, degree_title, institution_name, board_university, subject, passing_year, result_division')
                    .eq('user_id', user.id)
                    .order('passing_year', { ascending: true });
                setEducation(educationData || []);

                // Fetch domestic trainings
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: domesticData } = await (supabase as any)
                    .from('domestic_trainings')
                    .select('id, course_name, institution_name, duration, funding_source')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });
                setDomesticTrainings(domesticData || []);

                // Fetch foreign trainings
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: foreignTrainingData } = await (supabase as any)
                    .from('foreign_trainings')
                    .select('id, course_name, institution_name, country, duration, funding_source')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });
                setForeignTrainings(foreignTrainingData || []);

                // Fetch foreign travels
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: travelData } = await (supabase as any)
                    .from('foreign_travels')
                    .select('id, purpose, duration, country')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });
                setForeignTravels(travelData || []);

                // Fetch foreign postings
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: postingData } = await (supabase as any)
                    .from('foreign_postings')
                    .select('id, designation, institution_name, country, duration, funding_source')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });
                setForeignPostings(postingData || []);

                // Fetch lien/deputations
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data: lienData } = await (supabase as any)
                    .from('lien_deputations')
                    .select('id, designation, institution_name, country, duration, funding_source')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });
                setLienDeputations(lienData || []);

            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: language === 'bn' ? 'ত্রুটি' : 'Error',
                    description: language === 'bn' ? 'তথ্য লোড করতে সমস্যা হয়েছে' : 'Failed to load data',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, language, toast]);

    // Handle print/download
    const handlePrint = () => {
        window.print();
    };

    // Navigation handler
    const { handleNavigate: appNavigate } = useAppNavigation();
    const handleNavigation = (section: string) => appNavigate(section, language);

    // Format date helper
    const formatDate = (date: string | null) => {
        if (!date) return '----------------';
        return new Date(date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US');
    };

    // Get marital status label
    const getMaritalStatusLabel = (status: string | null) => {
        if (!status) return '----------------';
        const labels: Record<string, string> = {
            married: t.married,
            unmarried: t.unmarried,
            widow: t.widow,
            divorced: t.divorced,
            widower: t.widower,
        };
        return labels[status] || status;
    };

    // Calculate age from birth date
    const calculateAge = (birthDate: string | null) => {
        if (!birthDate) return '---';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen w-full bg-background flex">
                <AppSidebar language={language} onNavigate={handleNavigation} />

                <SidebarInset className="flex-1">
                    {/* Header - Hidden in print */}
                    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 print:hidden">
                        <div className="flex h-16 items-center gap-4 px-6">
                            <SidebarTrigger className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                                <Menu className="h-4 w-4" />
                            </SidebarTrigger>
                            <Breadcrumbs items={[{ label: t.pageTitle }]} />

                            <div className="flex-1" />

                            <div className="flex items-center gap-3">
                                <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
                                    <Printer className="h-4 w-4 mr-2" />
                                    {t.printBtn}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleNavigation('notifications')} className="relative">
                                    <Bell className="h-4 w-4" />
                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                                </Button>
                                <LanguageToggle onLanguageChange={setLanguage} currentLanguage={language} />
                                <ThemeToggle />
                            </div>
                        </div>
                    </header>

                    {/* Main Content - Printable Area */}
                    <main className="flex-1 p-6 print:p-0">
                        <div
                            ref={printRef}
                            className="max-w-4xl mx-auto bg-white text-black p-8 shadow-lg print:shadow-none print:max-w-none"
                            style={{ fontFamily: language === 'bn' ? 'SutonnyMJ, Kalpurush, sans-serif' : 'Times New Roman, serif' }}
                        >
                            {loading ? (
                                <div className="text-center py-10">
                                    {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                                </div>
                            ) : (
                                <>
                                    {/* Header */}
                                    <div className="text-right mb-2">
                                        <span className="text-sm">{t.annexure}</span>
                                    </div>
                                    <div className="text-center mb-6">
                                        <h1 className="text-xl font-bold mb-1">{t.title}</h1>
                                        <p className="text-sm">{t.subtitle}</p>
                                    </div>

                                    {/* Section 1: দাপ্তরিক তথ্যাবলি */}
                                    <div className="mb-6">
                                        <h2 className="font-bold mb-3">১।    {t.section1}</h2>
                                        <div className="space-y-2 pl-8">
                                            <p>{t.s1_a} : {office?.ministry || '----------------'}</p>
                                            <p>{t.s1_b} : {office?.directorate || '----------------'}</p>
                                            <p>{t.s1_c} : {office?.identity_number || '----------------'}</p>
                                            <p>{t.s1_d} : {office?.nid || '----------------'}</p>
                                            <p>{t.s1_e} : {office?.tin || '----------------'}</p>
                                            <p>
                                                {t.s1_f} {office?.birth_place || '----------------'} {t.s1_f_village} {office?.village || '----------------'} {t.s1_f_upazila} {office?.upazila || '----------------'} {t.s1_f_district} {office?.district || '----------------'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Section 2: সাধারণ তথ্যাবলি */}
                                    <div className="mb-6">
                                        <h2 className="font-bold mb-3">২।    {t.section2}</h2>
                                        <div className="space-y-2 pl-8">
                                            <p>{t.s2_a} : {profile?.full_name || '----------------'}</p>
                                            <p>{t.s2_b} : {formatDate(profile?.date_of_birth)}</p>
                                            <p>{t.s2_c} : {general?.father_name || '----------------'}</p>
                                            <p>{t.s2_d} : {general?.mother_name || '----------------'}</p>
                                            <p>{t.s2_e} : {profile?.address_line1 || '----------------'}</p>
                                            <p>{t.s2_f} : {general?.current_address || '----------------'}</p>
                                            <p>{t.s2_g} : {profile?.district || '----------------'}</p>
                                            <p>{t.s2_h} : {formatDate(profile?.joining_date)}</p>
                                            <p>{t.s2_i} : {formatDate(general?.current_position_joining_date)}</p>
                                            <p>{t.s2_j} : {profile?.designation || '----------------'}, {general?.workplace_address || '----------------'}, {general?.workplace_phone || '----------------'}</p>
                                            <p>{t.s2_k} : {general?.confirmation_order_number || '----------------'}, {formatDate(general?.confirmation_order_date)}</p>
                                            <p>{t.s2_l} : {general?.blood_group || '----------------'}</p>
                                            <p>{t.s2_m} : {general?.special_illness_info || '----------------'}</p>
                                            <p>{t.s2_n} : {profile?.phone || '----------------'} <br /> {t.s2_n_mobile} {general?.mobile_phone || '----------------'} <br />
                                                {t.s2_n_email} : {profile?.email || '----------------'}</p>
                                        </div>
                                    </div>

                                    {/* Section 3: বৈবাহিক অবস্থা */}
                                    <div className="mb-6">
                                        <h2 className="font-bold mb-3">৩।    {t.section3}</h2>
                                        <div className="space-y-2 pl-8">
                                            <p>{t.s3_a} : {getMaritalStatusLabel(marital?.marital_status || null)}</p>
                                            {spouses.length > 0 && (
                                                <>
                                                    <p>{t.s3_b} : {spouses[0]?.name || '----------------'}</p>
                                                    <p>{t.s3_c} : {spouses[0]?.occupation || '----------------'}</p>
                                                    <p>{t.s3_d} : {spouses[0]?.nid || '----------------'}</p>
                                                    <p>{t.s3_e} : {spouses[0]?.tin || '----------------'}</p>
                                                    <p>{t.s3_f} : {spouses[0]?.district || '----------------'}</p>
                                                    <p>{t.s3_g} : {spouses[0]?.employee_id || '----------------'}</p>
                                                    <p>{t.s3_h} : {spouses[0]?.designation || '----------------'}, {spouses[0]?.office_address || '----------------'}, {spouses[0]?.office_phone || '----------------'}</p>
                                                    {spouses.length > 1 && (
                                                        <p>{t.s3_i} : {spouses.slice(1).map(s => `${s.name || ''}`).join(', ') || '----------------'}</p>
                                                    )}
                                                </>
                                            )}
                                            {spouses.length === 0 && (
                                                <>
                                                    <p>{t.s3_b} : ----------------</p>
                                                    <p>{t.s3_c} : ----------------</p>
                                                    <p>{t.s3_d} : ----------------</p>
                                                    <p>{t.s3_e} : ----------------</p>
                                                    <p>{t.s3_f} : ----------------</p>
                                                    <p>{t.s3_g} : ----------------</p>
                                                    <p>{t.s3_h} : ----------------</p>
                                                    <p>{t.s3_i} : ----------------</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section 4: ছেলে/মেয়েদের জন্য (Table) */}
                                    <div className="mb-6">
                                        <h2 className="font-bold mb-3">৪।    {t.section4}</h2>
                                        <table className="w-full border-collapse border border-black text-sm">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-black px-2 py-1 text-center">{t.s4_serial}</th>
                                                    <th className="border border-black px-2 py-1">{t.s4_name}</th>
                                                    <th className="border border-black px-2 py-1">{t.s4_dob}</th>
                                                    <th className="border border-black px-2 py-1">{t.s4_gender}</th>
                                                    <th className="border border-black px-2 py-1">{t.s4_age}</th>
                                                    <th className="border border-black px-2 py-1">{t.s4_marital}</th>
                                                    <th className="border border-black px-2 py-1">{t.s4_special}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {children.length > 0 ? (
                                                    children.map((child, index) => (
                                                        <tr key={child.id}>
                                                            <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                                            <td className="border border-black px-2 py-1">{child.full_name || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{formatDate(child.birth_date)}</td>
                                                            <td className="border border-black px-2 py-1">
                                                                {child.gender === 'male' ? t.male : child.gender === 'female' ? t.female : child.gender || '-'}
                                                            </td>
                                                            <td className="border border-black px-2 py-1">{child.age || calculateAge(child.birth_date)}</td>
                                                            <td className="border border-black px-2 py-1">{getMaritalStatusLabel(child.marital_status)}</td>
                                                            <td className="border border-black px-2 py-1">{child.special_status || '-'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="border border-black px-2 py-4 text-center text-gray-500">
                                                            {language === 'bn' ? 'কোন তথ্য নেই' : 'No data'}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Section 5: শিক্ষাগত যোগ্যতা (Table) */}
                                    <div className="mb-6">
                                        <h2 className="font-bold mb-3">৫।    {t.section5}</h2>
                                        <table className="w-full border-collapse border border-black text-sm">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-black px-2 py-1 text-center">{t.s5_serial}</th>
                                                    <th className="border border-black px-2 py-1">{t.s5_degree}</th>
                                                    <th className="border border-black px-2 py-1">{t.s5_institution}</th>
                                                    <th className="border border-black px-2 py-1">{t.s5_board}</th>
                                                    <th className="border border-black px-2 py-1">{t.s5_subject}</th>
                                                    <th className="border border-black px-2 py-1">{t.s5_year}</th>
                                                    <th className="border border-black px-2 py-1">{t.s5_division}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {education.length > 0 ? (
                                                    education.map((edu, index) => (
                                                        <tr key={edu.id}>
                                                            <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                                            <td className="border border-black px-2 py-1">{edu.degree_title || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{edu.institution_name || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{edu.board_university || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{edu.subject || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{edu.passing_year || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{edu.result_division || '-'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="border border-black px-2 py-4 text-center text-gray-500">
                                                            {language === 'bn' ? 'কোন তথ্য নেই' : 'No data'}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Section 6a: দেশে প্রশিক্ষণ (Domestic Training) */}
                                    <div className="mb-6">
                                        <h2 className="font-bold mb-3">৬।    {t.s6a_title}</h2>
                                        <table className="w-full border-collapse border border-black text-sm">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-black px-2 py-1 text-center w-12">{t.s6a_serial}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6a_course}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6a_institution}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6a_duration}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6a_funding}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {domesticTrainings.length > 0 ? (
                                                    domesticTrainings.map((item, index) => (
                                                        <tr key={item.id}>
                                                            <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                                            <td className="border border-black px-2 py-1">{item.course_name || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.institution_name || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.duration || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.funding_source || '-'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="border border-black px-2 py-4 text-center text-gray-500">
                                                            {t.noData}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Section 6b: বৈদেশিক প্রশিক্ষণ (Foreign Training) */}
                                    <div className="mb-6">
                                        <h2 className="font-bold mb-3">{t.s6b_title}</h2>
                                        <table className="w-full border-collapse border border-black text-sm">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-black px-2 py-1 text-center w-12">{t.s6a_serial}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6a_course}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6b_institution_country}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6a_duration}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6a_funding}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {foreignTrainings.length > 0 ? (
                                                    foreignTrainings.map((item, index) => (
                                                        <tr key={item.id}>
                                                            <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                                            <td className="border border-black px-2 py-1">{item.course_name || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{[item.institution_name, item.country].filter(Boolean).join(', ') || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.duration || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.funding_source || '-'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="border border-black px-2 py-4 text-center text-gray-500">
                                                            {t.noData}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Section 6c: বিদেশ ভ্রমণ সংক্রান্ত তথ্য (Foreign Travel Information) */}
                                    <div className="mb-6">
                                        <h2 className="font-bold mb-3">{t.s6c_title}</h2>
                                        <table className="w-full border-collapse border border-black text-sm">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-black px-2 py-1 text-center w-12">{t.s6a_serial}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6c_purpose}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6c_duration}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6c_country}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {foreignTravels.length > 0 ? (
                                                    foreignTravels.map((item, index) => (
                                                        <tr key={item.id}>
                                                            <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                                            <td className="border border-black px-2 py-1">{item.purpose || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.duration || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.country || '-'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="border border-black px-2 py-4 text-center text-gray-500">
                                                            {t.noData}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Section 6d: বিদেশ পোস্টিং (Foreign Posting) */}
                                    <div className="mb-6">
                                        <h2 className="font-bold mb-3">{t.s6d_title}</h2>
                                        <table className="w-full border-collapse border border-black text-sm">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-black px-2 py-1 text-center w-12">{t.s6a_serial}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6d_designation}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6d_institution}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6d_country}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6d_duration}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6d_funding}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {foreignPostings.length > 0 ? (
                                                    foreignPostings.map((item, index) => (
                                                        <tr key={item.id}>
                                                            <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                                            <td className="border border-black px-2 py-1">{item.designation || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.institution_name || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.country || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.duration || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.funding_source || '-'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="border border-black px-2 py-4 text-center text-gray-500">
                                                            {t.noData}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Section 6e: লিয়েন/প্রেষণ (Lien/Deputation) */}
                                    <div className="mb-6">
                                        <h2 className="font-bold mb-3">{t.s6e_title}</h2>
                                        <table className="w-full border-collapse border border-black text-sm">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-black px-2 py-1 text-center w-12">{t.s6a_serial}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6d_designation}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6d_institution}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6d_country}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6d_duration}</th>
                                                    <th className="border border-black px-2 py-1">{t.s6d_funding}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lienDeputations.length > 0 ? (
                                                    lienDeputations.map((item, index) => (
                                                        <tr key={item.id}>
                                                            <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                                            <td className="border border-black px-2 py-1">{item.designation || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.institution_name || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.country || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.duration || '-'}</td>
                                                            <td className="border border-black px-2 py-1">{item.funding_source || '-'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="border border-black px-2 py-4 text-center text-gray-500">
                                                            {t.noData}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Page number */}
                                    {/* <div className="text-center mt-8 text-sm">
                                        <span>{t.page} 1</span>
                                    </div> */}
                                </>
                            )}
                        </div>
                    </main>
                </SidebarInset>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:max-w-none {
            max-width: none !important;
          }
          
          @page {
            size: A4;
            margin: 20mm;
          }
        }
      `}</style>
        </SidebarProvider>
    );
}
