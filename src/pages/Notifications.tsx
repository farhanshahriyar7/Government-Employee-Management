import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Bell, Filter, Download, Menu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useActivityCount } from "@/hooks/useActivityCount";

interface ActivityLog {
  id: string;
  action_type: string;
  action_description: string;
  entity_type: string;
  entity_id?: string;
  created_at: string;
}

const Notifications = ({ language }: { language: "en" | "bn" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      title: "Activity Logs",
      subtitle: "Track all your dashboard activities",
      action: "Action",
      description: "Description",
      type: "Type",
      time: "Time",
      filter: "Filter by Type",
      all: "All Activities",
      download: "Download Logs",
      noLogs: "No activity logs found",
      create: "Created",
      update: "Updated",
      loading: "Loading activities...",
      // Entity type labels
      profile: "Profile",
      general_information: "General Info",
      office_information: "Office Info",
      marital_information: "Marital Status",
      children_information: "Children Info",
      educational_qualifications: "Education",
      domestic_trainings: "Domestic Training",
      foreign_trainings: "Foreign Training",
      foreign_travels: "Foreign Travel",
      foreign_postings: "Foreign Posting",
      lien_deputations: "Lien/Deputation",
      // Action descriptions
      created_profile: "Created profile",
      updated_profile: "Updated profile",
      created_general_information: "Added general information",
      updated_general_information: "Updated general information",
      created_office_information: "Added office information",
      updated_office_information: "Updated office information",
      created_marital_information: "Added marital information",
      updated_marital_information: "Updated marital information",
      created_children_information: "Added children information",
      updated_children_information: "Updated children information",
      created_educational_qualifications: "Added educational qualification",
      updated_educational_qualifications: "Updated educational qualification",
      created_domestic_trainings: "Added domestic training",
      updated_domestic_trainings: "Updated domestic training",
      created_foreign_trainings: "Added foreign training",
      updated_foreign_trainings: "Updated foreign training",
      created_foreign_travels: "Added foreign travel record",
      updated_foreign_travels: "Updated foreign travel record",
      created_foreign_postings: "Added foreign posting",
      updated_foreign_postings: "Updated foreign posting",
      created_lien_deputations: "Added lien/deputation",
      updated_lien_deputations: "Updated lien/deputation",
    },
    bn: {
      title: "কার্যক্রম লগ",
      subtitle: "আপনার সমস্ত ড্যাশবোর্ড কার্যক্রম ট্র্যাক করুন",
      action: "কার্যক্রম",
      description: "বিবরণ",
      type: "ধরন",
      time: "সময়",
      filter: "ধরন অনুযায়ী ফিল্টার করুন",
      all: "সমস্ত কার্যক্রম",
      download: "লগ ডাউনলোড করুন",
      noLogs: "কোনো কার্যক্রম লগ পাওয়া যায়নি",
      create: "তৈরি করা হয়েছে",
      update: "আপডেট করা হয়েছে",
      loading: "কার্যক্রম লোড হচ্ছে...",
      // Entity type labels
      profile: "প্রোফাইল",
      general_information: "সাধারণ তথ্য",
      office_information: "দাপ্তরিক তথ্য",
      marital_information: "বৈবাহিক অবস্থা",
      children_information: "সন্তানদের তথ্য",
      educational_qualifications: "শিক্ষাগত যোগ্যতা",
      domestic_trainings: "দেশীয় প্রশিক্ষণ",
      foreign_trainings: "বিদেশী প্রশিক্ষণ",
      foreign_travels: "বিদেশ ভ্রমণ",
      foreign_postings: "বিদেশী পোস্টিং",
      lien_deputations: "লিয়েন/প্রেষণ",
      // Action descriptions
      created_profile: "প্রোফাইল তৈরি করা হয়েছে",
      updated_profile: "প্রোফাইল আপডেট করা হয়েছে",
      created_general_information: "সাধারণ তথ্য যোগ করা হয়েছে",
      updated_general_information: "সাধারণ তথ্য আপডেট করা হয়েছে",
      created_office_information: "দাপ্তরিক তথ্য যোগ করা হয়েছে",
      updated_office_information: "দাপ্তরিক তথ্য আপডেট করা হয়েছে",
      created_marital_information: "বৈবাহিক তথ্য যোগ করা হয়েছে",
      updated_marital_information: "বৈবাহিক তথ্য আপডেট করা হয়েছে",
      created_children_information: "সন্তানদের তথ্য যোগ করা হয়েছে",
      updated_children_information: "সন্তানদের তথ্য আপডেট করা হয়েছে",
      created_educational_qualifications: "শিক্ষাগত যোগ্যতা যোগ করা হয়েছে",
      updated_educational_qualifications: "শিক্ষাগত যোগ্যতা আপডেট করা হয়েছে",
      created_domestic_trainings: "দেশীয় প্রশিক্ষণ যোগ করা হয়েছে",
      updated_domestic_trainings: "দেশীয় প্রশিক্ষণ আপডেট করা হয়েছে",
      created_foreign_trainings: "বিদেশী প্রশিক্ষণ যোগ করা হয়েছে",
      updated_foreign_trainings: "বিদেশী প্রশিক্ষণ আপডেট করা হয়েছে",
      created_foreign_travels: "বিদেশ ভ্রমণ রেকর্ড যোগ করা হয়েছে",
      updated_foreign_travels: "বিদেশ ভ্রমণ রেকর্ড আপডেট করা হয়েছে",
      created_foreign_postings: "বিদেশী পোস্টিং যোগ করা হয়েছে",
      updated_foreign_postings: "বিদেশী পোস্টিং আপডেট করা হয়েছে",
      created_lien_deputations: "লিয়েন/প্রেষণ যোগ করা হয়েছে",
      updated_lien_deputations: "লিয়েন/প্রেষণ আপডেট করা হয়েছে",
    },
  };

  const t = translations[language];

  // Mark activities as seen and get count for sidebar badge
  const { count: notificationCount, markAsSeen } = useActivityCount();

  useEffect(() => {
    if (user) {
      fetchActivityLogs();
      // Mark all activities as seen when visiting this page
      markAsSeen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (filterType === "all") {
      setFilteredLogs(activityLogs);
    } else {
      setFilteredLogs(activityLogs.filter(log => log.action_type === filterType));
    }
  }, [filterType, activityLogs]);

  const fetchActivityLogs = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const activities: ActivityLog[] = [];

      // Helper to create activity from record
      const createActivity = (
        record: { id: string; created_at: string; updated_at?: string | null },
        entityType: string
      ) => {
        const isUpdate = record.updated_at && record.updated_at !== record.created_at;
        const actionType = isUpdate ? 'update' : 'create';
        const descKey = `${actionType}d_${entityType}` as keyof typeof t;

        return {
          id: `${entityType}-${record.id}`,
          action_type: actionType,
          action_description: t[descKey] || `${actionType}d ${entityType.replace(/_/g, ' ')}`,
          entity_type: entityType,
          entity_id: record.id,
          created_at: isUpdate ? record.updated_at! : record.created_at,
        };
      };

      // Fetch from all tables in parallel
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = supabase as any;

      const [
        profileRes,
        generalRes,
        officeRes,
        maritalRes,
        childrenRes,
        educationRes,
        domesticRes,
        foreignTrainingRes,
        foreignTravelRes,
        foreignPostingRes,
        lienRes,
      ] = await Promise.all([
        s.from('profiles').select('id, created_at, updated_at').eq('id', user.id),
        s.from('general_information').select('id, created_at, updated_at').eq('user_id', user.id),
        s.from('office_information').select('id, created_at, updated_at').eq('user_id', user.id),
        s.from('marital_information').select('id, created_at, updated_at').eq('user_id', user.id),
        s.from('children_information').select('id, created_at, updated_at').eq('user_id', user.id),
        s.from('educational_qualifications').select('id, created_at, updated_at').eq('user_id', user.id),
        s.from('domestic_trainings').select('id, created_at, updated_at').eq('user_id', user.id),
        s.from('foreign_trainings').select('id, created_at, updated_at').eq('user_id', user.id),
        s.from('foreign_travels').select('id, created_at, updated_at').eq('user_id', user.id),
        s.from('foreign_postings').select('id, created_at, updated_at').eq('user_id', user.id),
        s.from('lien_deputations').select('id, created_at, updated_at').eq('user_id', user.id),
      ]);

      // Process each table's results
      if (profileRes.data) {
        profileRes.data.forEach((r: any) => activities.push(createActivity(r, 'profile')));
      }
      if (generalRes.data) {
        generalRes.data.forEach((r: any) => activities.push(createActivity(r, 'general_information')));
      }
      if (officeRes.data) {
        officeRes.data.forEach((r: any) => activities.push(createActivity(r, 'office_information')));
      }
      if (maritalRes.data) {
        maritalRes.data.forEach((r: any) => activities.push(createActivity(r, 'marital_information')));
      }
      if (childrenRes.data) {
        childrenRes.data.forEach((r: any) => activities.push(createActivity(r, 'children_information')));
      }
      if (educationRes.data) {
        educationRes.data.forEach((r: any) => activities.push(createActivity(r, 'educational_qualifications')));
      }
      if (domesticRes.data) {
        domesticRes.data.forEach((r: any) => activities.push(createActivity(r, 'domestic_trainings')));
      }
      if (foreignTrainingRes.data) {
        foreignTrainingRes.data.forEach((r: any) => activities.push(createActivity(r, 'foreign_trainings')));
      }
      if (foreignTravelRes.data) {
        foreignTravelRes.data.forEach((r: any) => activities.push(createActivity(r, 'foreign_travels')));
      }
      if (foreignPostingRes.data) {
        foreignPostingRes.data.forEach((r: any) => activities.push(createActivity(r, 'foreign_postings')));
      }
      if (lienRes.data) {
        lienRes.data.forEach((r: any) => activities.push(createActivity(r, 'lien_deputations')));
      }

      // Sort by most recent first
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setActivityLogs(activities);
      setFilteredLogs(activities);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'কার্যক্রম লোড করতে ব্যর্থ' : 'Failed to load activities',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      default:
        return "default";
    }
  };

  const getEntityLabel = (entityType: string) => {
    const key = entityType as keyof typeof t;
    return t[key] || entityType.replace(/_/g, ' ');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownloadLogs = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLogs.map((log) => ({
        Action: log.action_type,
        Description: log.action_description,
        Type: getEntityLabel(log.entity_type),
        Time: formatDateTime(log.created_at),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Logs");
    XLSX.writeFile(workbook, `activity_logs_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const { handleNavigate: appNavigate } = useAppNavigation();
  const handleNavigation = (section: string) => appNavigate(section, language);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar language={language} onNavigate={handleNavigation} notificationCount={0} />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <Breadcrumbs items={[{ label: language === 'bn' ? 'কার্যক্রম লগ' : 'Activity Logs' }]} />

              <div className="flex-1" />

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => handleNavigation('notifications')} className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                </Button>
                <LanguageToggle onLanguageChange={() => { }} currentLanguage={language} />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">{t.title}</h1>
                  <p className="text-muted-foreground">{t.subtitle}</p>
                </div>
              </div>

              <div className="flex gap-4 items-center justify-between">
                <div className="flex gap-2 items-center">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t.filter} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      <SelectItem value="create">{t.create}</SelectItem>
                      <SelectItem value="update">{t.update}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleDownloadLogs} variant="outline" size="sm" disabled={filteredLogs.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  {t.download}
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary hover:bg-primary">
                      <TableHead className="text-primary-foreground">{t.action}</TableHead>
                      <TableHead className="text-primary-foreground">{t.description}</TableHead>
                      <TableHead className="text-primary-foreground">{t.type}</TableHead>
                      <TableHead className="text-primary-foreground">{t.time}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>{t.loading}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          {t.noLogs}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(log.action_type)}>
                              {log.action_type === 'create' ? t.create : t.update}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.action_description}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {getEntityLabel(log.entity_type)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateTime(log.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Notifications;
