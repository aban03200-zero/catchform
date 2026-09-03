"use client"

// FormAdmin.tsx — InsideOut / SniperFactory Form Builder v3
// Next.js Client Component — Toss 디자인 시스템 적용

import * as React from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// ─── Types ────────────────────────────────────────────────────────────────
type Theme = "dark" | "light"
type Opt = { label: string; value: string; isEtc: boolean; nextPage?: number }
type Cat = { id: string; name: string; brand?: string; slug?: string }
type Prog = { id: string; title: string; slug?: string; category?: string; [key:string]:any }
type BrandId = "SNIPERFACTORY"|"INSIDEOUT"|"SFACSPACE"
type DashboardFormType = "alert"|"application"|"recruit"|"survey"|"evaluation"|"other"
type DashboardManualStatus = ""|"draft"|"active"|"closed"
type RecruitmentPeriodMode = "pre"|"formal"
type ConsentPosition = "start"|"end"
type OperationPeriodType = "range"|"single"
type OperationPeriod = { id:string; type:OperationPeriodType; label?:string; start?:string; end?:string; date?:string; enabled?:boolean }
type EducationScheduleType = "range"|"single"
type EducationSchedule = { id:string; type:EducationScheduleType; label?:string; start?:string; end?:string; date?:string }
type DashboardMeta = { formTypeTag?:DashboardFormType; operationStart?:string; operationEnd?:string; operationPeriods?:OperationPeriod[]; alwaysOpen?:boolean; manualStatus?:DashboardManualStatus; isPublished?:boolean; publishedAt?:string; editPasswordHash?:string; formTrashedAt?:string }
type AdminRole = ""|"admin"|"master"
type DashboardSettingsState = {item:any;formName:string;brand:BrandId;formTypeTag:DashboardFormType;operationStart:string;operationEnd:string;operationPeriods:OperationPeriod[];alwaysOpen:boolean;manualStatus:DashboardManualStatus;currentEditPasswordDraft:string;editPasswordDraft:string;clearEditPassword:boolean}
type KdtFieldType = FieldType|"section_desc"
type ConsentDocMode = "brand"|"custom"
type KdtField = { id:string; label:string; type:KdtFieldType; required?:boolean; page?:number; options?:string[]; placeholder?:string; desc?:string; [key:string]:any }
type AdMode = "image"|"split"
type ModalShareKey = "kakao"|"instagram"|"threads"|"x"|"link"
type ModalShareButtons = Record<ModalShareKey,boolean>
type FieldType = "text"|"name"|"phone"|"email"|"referral"|"date"|"time"|"dropdown"|"button_select"|"checkbox"|"textarea"|"info"|"file"|"ad"
type HelperItem = { text:string; callout?:boolean }
type FormField = { id:string; type:FieldType; label:string; placeholder?:string; helper?:string; helpers?:HelperItem[]; required?:boolean; opts?:Opt[]; etcPh?:string; dupCheck?:boolean; page?:number; cols?:number; imageUrl?:string; imageCaption?:string; imageFit?:"contain"|"cover"; imagePosX?:number; imagePosY?:number; imageCropX?:number; imageCropY?:number; imageCropW?:number; imageCropH?:number; imageNaturalW?:number; imageNaturalH?:number; adMode?:AdMode; adMainText?:string; adSubText?:string; adElementText?:string; adElementImageUrl?:string; adHref?:string; adBg?:string; adTextColor?:string; birthYearLimitEnabled?:boolean; birthYearLimitYear?:number|string; birthYearLimitMessage?:string; birthDateRangeEnabled?:boolean; birthDateRangeStart?:string; birthDateRangeEnd?:string; birthDateRangeMessage?:string }
type FormAdConfig = { enabled:boolean; adMode:AdMode; imageUrl?:string; imageCaption?:string; imageFit?:"contain"|"cover"; imagePosX?:number; imagePosY?:number; imageCropX?:number; imageCropY?:number; imageCropW?:number; imageCropH?:number; imageNaturalW?:number; imageNaturalH?:number; adMainText?:string; adSubText?:string; adElementText?:string; adElementImageUrl?:string; adHref?:string; adBg?:string; adTextColor?:string }
type QrLink = { code:string; url:string; label?:string; type?:string; createdAt?:string }
type Cfg = {
  header: { imageUrl:string; programId:string; programUnlinked?:boolean; recruitmentPeriodMode?:RecruitmentPeriodMode; overline:string; title:string; educationStart:string; educationEnd:string; educationSchedules?:EducationSchedule[]; tuitionFree:boolean; tuitionFreeText:string; tuitionAmount:string; stipend:string; noticeEnabled:boolean; noticeIconEnabled:boolean; noticeIconText:string; noticeText:string; noticeShape?:"pill"|"rect"; applicationType?:string; imageFit?:"contain"|"cover"; imagePosX?:number; imagePosY?:number; imageCropX?:number; imageCropY?:number; imageCropW?:number; imageCropH?:number; imageNaturalW?:number; imageNaturalH?:number }
  ad?: FormAdConfig
  form: { fields:FormField[]; showNum:boolean; dupText:string; pages:number; pageLabels?:string[]; consentPosition?:ConsentPosition }
  consents: { enabled:boolean; required:boolean; title:string; consentType?:string; body:string; checkLabel:string; policyUrl:string; policyMode?:ConsentDocMode; customPolicyTitle?:string; customPolicyBody?:string }[]
  cta: { label:string; loadLabel:string; height:number; bg:string; color:string }
  modal: { title:string; body:string; btnLabel:string; btnUrl:string; btnReplace:boolean; shareButtons?:Partial<ModalShareButtons> }
  styles: { theme:Theme; fieldH:number; qGap:number; maxW:number; labelGap?:number; seniorMode?:boolean }
  auth: { enabled:boolean; loginUrl:string; errText:string }
  integrations?: { googleSheets?: { enabled:boolean; mode:"existing"|"new"; accountEmail:string; sheetUrl:string; sheetName:string; webhookUrl:string; lastSyncStatus?:"idle"|"sent"|"error"; lastSyncAt?:string; lastSyncMessage?:string }; qrLinks?:QrLink[] }
  dashboard?: DashboardMeta
  brand: string
  formType?: "alert"|"kdt"|"blank"|"edu_biz"|"company"|"recruit"
  kdtFields?: KdtField[]
}
type EditorTab = { key:string; id:string; name:string; slug:string; brand:string; cfg:Cfg; isDraft?:boolean }

// ─── Admin UI theme (Toss-style) ─────────────────────────────────────────
type AT = { bg:string; card:string; card2:string; border:string; border2:string; blue:string; blue2:string; t1:string; t2:string; t3:string; t4:string; green:string; red:string; shadow:string; r:string; r2:string }
const ALT: AT = {
  bg:"#F6F7F9", card:"#FFFFFF", card2:"#F1F3F6",
  border:"#EDEFF3", border2:"#D5D9DF",
  blue:"#3182F6", blue2:"#EAF2FE",
  t1:"#15181D", t2:"#5A6270", t3:"#9AA1AD", t4:"#C4CAD4",
  green:"#2FBF71", red:"#E5484D",
  shadow:"0 1px 2px rgba(16,24,40,.06), 0 12px 32px -20px rgba(16,24,40,.28)",
  r:"8px", r2:"12px",
}
const ADK: AT = {
  bg:"#0F1117", card:"#1A1D23", card2:"#21252C",
  border:"rgba(255,255,255,0.07)", border2:"rgba(255,255,255,0.13)",
  blue:"#4E94FF", blue2:"rgba(78,148,255,0.12)",
  t1:"#F3F4F6", t2:"#9CA3AF", t3:"#6B7280", t4:"#374151",
  green:"#22C55E", red:"#F06B6B",
  shadow:"0 1px 4px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)",
  r:"8px", r2:"12px",
}

const IMAGE_UPLOAD_MAX_WIDTH = 1600
const IMAGE_UPLOAD_MAX_HEIGHT = 1200
const IMAGE_UPLOAD_QUALITY = 0.78
const COMPRESSIBLE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = event => resolve(String(event.target?.result || ""))
    reader.onerror = () => reject(reader.error || new Error("이미지를 읽지 못했어요."))
    reader.readAsDataURL(file)
  })
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("이미지를 불러오지 못했어요."))
    img.src = src
  })
}

async function readCompressedImageFile(file: File) {
  const original = await readFileAsDataUrl(file)
  if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type)) return original

  try {
    const img = await loadImageElement(original)
    const naturalW = img.naturalWidth || img.width
    const naturalH = img.naturalHeight || img.height
    if (!naturalW || !naturalH) return original

    const scale = Math.min(1, IMAGE_UPLOAD_MAX_WIDTH / naturalW, IMAGE_UPLOAD_MAX_HEIGHT / naturalH)
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(naturalW * scale))
    canvas.height = Math.max(1, Math.round(naturalH * scale))

    const ctx = canvas.getContext("2d")
    if (!ctx) return original
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const targetType = file.type === "image/png" || file.type === "image/webp" ? "image/webp" : "image/jpeg"
    const compressed = canvas.toDataURL(targetType, IMAGE_UPLOAD_QUALITY)
    if (!compressed.startsWith(`data:${targetType}`)) return original
    return compressed.length < original.length ? compressed : original
  } catch {
    return original
  }
}

// ─── Form preview colors ──────────────────────────────────────────────────
type FCS = { bg:string; fieldBg:string; fieldBorder:string; t1:string; t2:string; t3:string; red:string }
const FD: FCS = { bg:"#0B0C0E", fieldBg:"rgba(255,255,255,0.04)", fieldBorder:"rgba(255,255,255,0.10)", t1:"rgba(255,255,255,0.92)", t2:"rgba(255,255,255,0.62)", t3:"rgba(255,255,255,0.32)", red:"#FF4B4B" }
const FL: FCS = { bg:"#FFFFFF", fieldBg:"rgba(0,0,0,0.03)", fieldBorder:"rgba(0,0,0,0.12)", t1:"rgba(0,0,0,0.88)", t2:"rgba(0,0,0,0.55)", t3:"rgba(0,0,0,0.32)", red:"#FF4B4B" }
const SENIOR_TEXT = { t1:"#111111", t2:"#18181B", t3:"#3F3F46", red:"#C81E1E" }
const seniorFormColors = (base:FCS):FCS => ({ ...base, ...SENIOR_TEXT })
// Pretendard 폰트 로드
if(typeof document!=="undefined"&&!document.getElementById("pretendard-cdn")){
  const l=document.createElement("link");l.id="pretendard-cdn";l.rel="stylesheet";
  l.href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";
  document.head.appendChild(l)
}
if(typeof document!=="undefined"&&!document.getElementById("catchform-keyframes")){
  const s=document.createElement("style");s.id="catchform-keyframes";
  s.textContent=`
    @keyframes toastIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes toastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-10px)}}
    @keyframes actionSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes skeletonPulse{0%,100%{opacity:1}50%{opacity:0.4}}
  `;
  document.head.appendChild(s)
}
const FONT = "'Pretendard Variable','Pretendard','Noto Sans KR',-apple-system,'Apple SD Gothic Neo',sans-serif"
const seniorFontSize = (enabled:boolean, size:number) => enabled ? Math.round(size * 1.34 * 10) / 10 : size
const seniorFieldHeight = (enabled:boolean, height:number) => enabled ? Math.max(56, Math.round(height * 1.24)) : height
const seniorGap = (enabled:boolean, gap:number) => enabled ? Math.round(gap * 1.16) : gap
const DASHBOARD_PAGE_SIZE = 60
// 편집 화면 우측 패널 제목 아래 설명 (시안 PANELS.sub 기준)
const PANEL_SUBS:Record<string,string> = {
  header:"폼 상단에 노출되는 대표 이미지와 제목, 운영 기간을 설정합니다.",
  notice:"제목 아래 회색 박스에 들어가는 안내 문장입니다.",
  ad:"대표 이미지와 제목 아래, 질문 시작 전에 배너를 노출합니다.",
  form:"단계별 질문을 추가하고 순서를 바꿉니다.",
  consent:"개인정보 수집·이용 동의 항목을 관리합니다.",
  login:"응답 전 로그인을 요구할 수 있습니다.",
  integrations:"응답이 접수될 때 외부 도구로 전달합니다.",
  slug:"폼 공개 주소를 정합니다.",
  qr:"현장 배포용 QR 코드를 만들고 다운로드합니다.",
  cta:"단계 이동과 제출 버튼의 문구와 색을 정합니다.",
  modal:"제출 후 보여줄 화면을 설정합니다.",
  styles:"폼 전체의 색과 모서리, 폰트를 조정합니다.",
}
const RECENT_EDIT_STORAGE_KEY = "catchform.admin.recentEdits"
const RECENT_EDIT_LIMIT = 50
function normalizeAdminRole(role:any):AdminRole{
  const normalized=String(role||"").trim().toLowerCase()
  return normalized==="admin"||normalized==="master"?normalized:""
}
function canUseAdmin(role:any){return normalizeAdminRole(role)==="admin"||normalizeAdminRole(role)==="master"}
function canMasterReset(role:any){return normalizeAdminRole(role)==="master"}
function mergeFormRows(existing:any[],incoming:any[]){
  const map=new Map<string,any>()
  existing.forEach(item=>map.set(String(item.id),item))
  incoming.forEach(item=>map.set(String(item.id),item))
  return Array.from(map.values())
}
const FILE_MAX_COUNT = 5
const FILE_MAX_SIZE_MB = 10
const FILE_LIMIT_TEXT = `최대 ${FILE_MAX_COUNT}개, 파일당 ${FILE_MAX_SIZE_MB}MB`
const AD_IMAGE_SIZE_TEXT = "권장 1200 × 300px (4:1)"
const DISPLAY_ONLY_FIELD_TYPES = new Set(["info","section_desc","ad"])
function isDisplayOnlyFieldType(type:any){return DISPLAY_ONLY_FIELD_TYPES.has(String(type||""))}
function birthYearLimitOf(field:any){
  if(!field?.birthYearLimitEnabled)return null
  const year=Number(String(field.birthYearLimitYear??"").replace(/[^\d]/g,""))
  return Number.isFinite(year)&&year>=1000&&year<=9999?year:null
}
function normalizeDateOnly(value:any){
  const match=String(value||"").trim().match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/)
  if(!match)return""
  const year=Number(match[1]),month=Number(match[2]),day=Number(match[3])
  if(!Number.isFinite(year)||!Number.isFinite(month)||!Number.isFinite(day))return""
  if(year<1000||year>9999||month<1||month>12)return""
  const maxDay=new Date(year,month,0).getDate()
  if(day<1||day>maxDay)return""
  return`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
}
function dateOnlyTime(value:any){
  const normalized=normalizeDateOnly(value)
  if(!normalized)return null
  const [year,month,day]=normalized.split("-").map(Number)
  return Date.UTC(year,month-1,day)
}
function displayBirthDateWithAge(value:any){
  const normalized=normalizeDateOnly(value)
  if(!normalized)return""
  const [year,month,day]=normalized.split("-").map(Number)
  const age=new Date().getFullYear()-year
  return`${year}.${String(month).padStart(2,"0")}.${String(day).padStart(2,"0")}(만 ${age}세)`
}
function birthDateRangeOf(field:any){
  if(field?.birthDateRangeEnabled){
    let start=normalizeDateOnly(field.birthDateRangeStart)
    let end=normalizeDateOnly(field.birthDateRangeEnd)
    if(!start&&!end)return null
    const startTime=dateOnlyTime(start)
    const endTime=dateOnlyTime(end)
    if(start&&end&&startTime!==null&&endTime!==null&&startTime>endTime){const nextStart=end;end=start;start=nextStart}
    return{start,end}
  }
  const legacyYear=birthYearLimitOf(field)
  if(legacyYear)return{start:"",end:`${legacyYear}-12-31`,legacyYear}
  return null
}
function birthDateRangeSummary(field:any){
  const range=birthDateRangeOf(field)
  if(!range)return""
  if(range.legacyYear)return`${range.legacyYear}년생 이하`
  if(range.start&&range.end)return`${displayBirthDateWithAge(range.start)} ~ ${displayBirthDateWithAge(range.end)}`
  if(range.start)return`${displayBirthDateWithAge(range.start)} 이후`
  if(range.end)return`${displayBirthDateWithAge(range.end)} 이전`
  return""
}
function dateBirthYearLimitError(field:any,value:any){
  if(field?.type!=="date"||!value)return""
  const range=birthDateRangeOf(field)
  if(!range)return""
  const selectedTime=dateOnlyTime(value)
  if(selectedTime===null)return""
  const startTime=dateOnlyTime(range.start)
  const endTime=dateOnlyTime(range.end)
  if((startTime!==null&&selectedTime<startTime)||(endTime!==null&&selectedTime>endTime)){
    const customMessage=String(field.birthDateRangeMessage||field.birthYearLimitMessage||"").trim()
    if(customMessage)return customMessage
    const summary=birthDateRangeSummary(field)
    return summary?`${summary} 출생자만 응답할 수 있어요.`:"응답 가능한 생년월일 범위를 벗어났어요."
  }
  return""
}
const CATCHFORM_DIRECT_FORM_BASE_URL = "https://catchform.vercel.app/form"
const FORM_SUMMARY_SELECT = "id,name,slug,updated_at,brand,config_brand:config->>brand,header_title:config->header->>title,program_id:config->header->>programId,recruitment_period_mode:config->header->>recruitmentPeriodMode,form_type:config->>formType,dashboard_meta:config->dashboard"
const FULL_FORM_PREFETCH_LIMIT = 8
const FULL_FORM_PREFETCH_CONCURRENCY = 2
const DEFAULT_GOOGLE_SHEETS = {enabled:false,mode:"existing" as const,accountEmail:"",sheetUrl:"",sheetName:"",webhookUrl:"",lastSyncStatus:"idle" as const,lastSyncAt:"",lastSyncMessage:""}
const DEFAULT_MODAL_SHARE_BUTTONS:ModalShareButtons = {kakao:true,instagram:true,threads:true,x:true,link:true}
const DEFAULT_FORM_AD:FormAdConfig = {
  enabled:false,
  adMode:"image",
  imageUrl:"",
  imageCaption:"",
  imageFit:"cover",
  imagePosX:50,
  imagePosY:50,
  imageCropX:0,
  imageCropY:0,
  imageCropW:100,
  imageCropH:100,
  adMainText:"지금 가장 많이 찾는 프로그램",
  adSubText:"혜택과 모집 일정을 한눈에 확인해보세요.",
  adElementText:"자세히 보기",
  adElementImageUrl:"",
  adHref:"",
  adBg:"#FEE500",
  adTextColor:"#191919",
}
const DASHBOARD_FORM_TYPES:{value:DashboardFormType;label:string}[]=[
  {value:"alert",label:"사전 알림"},
  {value:"application",label:"신청"},
  {value:"recruit",label:"채용"},
  {value:"survey",label:"설문"},
  {value:"evaluation",label:"평가"},
  {value:"other",label:"기타"},
]
const ANALYTICS_EVENT_LIMIT = 5000
const ANALYTICS_EVENT_SELECT = "id,form_id,form_slug,session_id,event_type,page,field_id,field_label,metadata,created_at"
function legacyDashboardFormType(formType?:Cfg["formType"]):DashboardFormType{
  if(formType==="alert")return"alert"
  if(formType==="recruit")return"recruit"
  if(formType==="kdt"||formType==="edu_biz"||formType==="company")return"application"
  return"other"
}
function firstDateValue(source:any,keys:string[]){
  for(const key of keys){const value=source?.[key];if(typeof value==="string"&&value.trim())return value.trim()}
  return""
}
const FORMAL_RECRUITMENT_START_KEYS=[
  "formal_recruitment_start","formal_recruitment_start_at","formal_recruitment_start_date",
  "formal_recruit_start","formal_recruit_start_at","formal_recruit_start_date",
  "formal_application_start","formal_application_start_at","formal_application_start_date",
  "formal_apply_start","formal_apply_start_at","formal_apply_start_date",
  "regular_recruitment_start","regular_recruitment_start_at","regular_recruitment_start_date",
  "official_recruitment_start","official_recruitment_start_at","official_recruitment_start_date",
  "recruitment_start","recruitment_start_at","recruitment_start_date",
  "recruit_start","recruit_start_at","recruit_start_date",
  "application_start","application_start_at","application_start_date",
  "apply_start","apply_start_at",
]
const FORMAL_RECRUITMENT_END_KEYS=[
  "formal_recruitment_end","formal_recruitment_end_at","formal_recruitment_end_date",
  "formal_recruit_end","formal_recruit_end_at","formal_recruit_end_date",
  "formal_application_end","formal_application_end_at","formal_application_end_date",
  "formal_apply_end","formal_apply_end_at","formal_apply_end_date",
  "regular_recruitment_end","regular_recruitment_end_at","regular_recruitment_end_date",
  "official_recruitment_end","official_recruitment_end_at","official_recruitment_end_date",
  "recruitment_end","recruitment_end_at","recruitment_end_date",
  "recruit_end","recruit_end_at","recruit_end_date",
  "application_end","application_end_at","application_end_date",
  "apply_end","apply_end_at",
]
const PRE_RECRUITMENT_START_KEYS=[
  "pre_recruitment_start","pre_recruitment_start_at","pre_recruitment_start_date",
  "pre_recruitment_period_start","pre_recruitment_period_start_at","pre_recruitment_period_start_date",
  "pre_recruit_start","pre_recruit_start_at","pre_recruit_start_date",
  "pre_application_start","pre_application_start_at","pre_application_start_date",
  "pre_apply_start","pre_apply_start_at","pre_apply_start_date",
  "pre_registration_start","pre_registration_start_at","pre_registration_start_date",
  "early_recruitment_start","early_recruitment_start_at","early_recruitment_start_date",
  "early_application_start","early_application_start_at","early_application_start_date",
  "notice_start","notice_start_at","notice_start_date",
  "notification_start","notification_start_at","notification_start_date",
  "pre_start","pre_start_at","pre_start_date",
]
const PRE_RECRUITMENT_END_KEYS=[
  "pre_recruitment_end","pre_recruitment_end_at","pre_recruitment_end_date",
  "pre_recruitment_period_end","pre_recruitment_period_end_at","pre_recruitment_period_end_date",
  "pre_recruit_end","pre_recruit_end_at","pre_recruit_end_date",
  "pre_application_end","pre_application_end_at","pre_application_end_date",
  "pre_apply_end","pre_apply_end_at","pre_apply_end_date",
  "pre_registration_end","pre_registration_end_at","pre_registration_end_date",
  "early_recruitment_end","early_recruitment_end_at","early_recruitment_end_date",
  "early_application_end","early_application_end_at","early_application_end_date",
  "notice_end","notice_end_at","notice_end_date",
  "notification_end","notification_end_at","notification_end_date",
  "pre_end","pre_end_at","pre_end_date",
]
function recruitmentPeriodModeOf(config:any):RecruitmentPeriodMode{
  return config?.header?.recruitmentPeriodMode==="pre"?"pre":"formal"
}
function recruitmentPeriodLabel(mode:RecruitmentPeriodMode){
  return mode==="pre"?"사전 모집 기간":"정식 모집 기간"
}
function recruitmentPeriodOf(program?:Prog,mode:RecruitmentPeriodMode="formal"){
  if(!program)return{start:"",end:""}
  const startKeys=mode==="pre"?PRE_RECRUITMENT_START_KEYS:FORMAL_RECRUITMENT_START_KEYS
  const endKeys=mode==="pre"?PRE_RECRUITMENT_END_KEYS:FORMAL_RECRUITMENT_END_KEYS
  return{
    start:firstDateValue(program,startKeys),
    end:firstDateValue(program,endKeys),
  }
}
function compactDateTimeText(value:string){
  const raw=String(value||"").trim()
  if(!raw)return""
  const dateOnly=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if(dateOnly)return`${dateOnly[1]}.${dateOnly[2]}.${dateOnly[3]}`
  const d=new Date(raw)
  if(!Number.isNaN(d.getTime())){
    const pad=(n:number)=>String(n).padStart(2,"0")
    return`${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return raw.replace("T"," ").replace(/([+-]\d{2}:?\d{2}|Z)$/,"").slice(0,16).replace(/-/g,".")
}
function recruitmentPeriodText(period:{start?:string;end?:string},emptyText="기간 데이터 없음"){
  const start=compactDateTimeText(period.start||"")
  const end=compactDateTimeText(period.end||"")
  return start||end?`${start||"시작 미정"} ~ ${end||"종료 미정"}`:emptyText
}
function operationInputValue(value:string,edge:"start"|"end"="start"){
  const raw=String(value||"").trim()
  if(!raw)return""
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw))return`${raw}T${edge==="end"?"23:59":"00:00"}`
  return raw.slice(0,16)
}
function operationTimeMs(value:string,edge:"start"|"end"="start"){
  const raw=String(value||"").trim()
  if(!raw)return 0
  const normalized=/^\d{4}-\d{2}-\d{2}$/.test(raw)?`${raw}T${edge==="end"?"23:59:59":"00:00:00"}`:raw
  const time=new Date(normalized).getTime()
  return Number.isFinite(time)?time:0
}
function makeOperationPeriod(type:OperationPeriodType="range",patch:Partial<OperationPeriod>={}):OperationPeriod{
  const id=patch.id||`period_${Date.now()}_${Math.random().toString(36).slice(2,7)}`
  return type==="single"
    ? {id,type,date:"",enabled:true,...patch}
    : {id,type,start:"",end:"",enabled:true,...patch}
}
function normalizeOperationPeriod(raw:any,index=0):OperationPeriod|null{
  if(!raw||typeof raw!=="object")return null
  const type:OperationPeriodType=raw.type==="single"?"single":"range"
  const id=String(raw.id||`period_${index+1}`).trim()
  const base:OperationPeriod={id,type,enabled:raw.enabled!==false,label:String(raw.label||"").trim()}
  if(type==="single"){
    const date=String(raw.date||raw.start||"").trim().slice(0,10)
    return {...base,date}
  }
  return {...base,start:String(raw.start||"").trim(),end:String(raw.end||"").trim()}
}
function operationPeriodsFromDashboard(dashboard?:DashboardMeta|null,fallback?:{start?:string;end?:string}):OperationPeriod[]{
  const raw=Array.isArray(dashboard?.operationPeriods)?dashboard!.operationPeriods:[]
  const normalized=raw.map((item,index)=>normalizeOperationPeriod(item,index)).filter(Boolean) as OperationPeriod[]
  if(normalized.length)return normalized
  const start=String(dashboard?.operationStart||fallback?.start||"").trim()
  const end=String(dashboard?.operationEnd||fallback?.end||"").trim()
  return start||end?[makeOperationPeriod("range",{id:"legacy_period",label:"운영 기간",start,end})]:[]
}
function operationPeriodRange(period:OperationPeriod){
  if(period.enabled===false)return null
  if(period.type==="single"){
    const date=String(period.date||period.start||"").trim().slice(0,10)
    const startAt=operationTimeMs(date,"start")
    const endAt=operationTimeMs(date,"end")
    return startAt&&endAt?{startAt,endAt,start:date,end:date}:null
  }
  const start=String(period.start||"").trim()
  const end=String(period.end||"").trim()
  const startAt=operationTimeMs(start,"start")
  const endAt=operationTimeMs(end,"end")
  if(!startAt&&!endAt)return null
  return{startAt,endAt,start,end}
}
function validOperationPeriods(periods:OperationPeriod[]){
  return periods.map(operationPeriodRange).filter(Boolean) as {startAt:number;endAt:number;start:string;end:string}[]
}
function operationPeriodsError(periods:OperationPeriod[],requireOne=false){
  const enabled=periods.filter(period=>period.enabled!==false)
  if(requireOne&&!enabled.length)return"폼 운영 기간을 1개 이상 추가해주세요."
  for(const period of enabled){
    if(period.type==="single"){
      if(!String(period.date||"").trim())return"단일 날짜의 날짜를 입력해주세요."
      if(!operationTimeMs(period.date||"","start"))return"단일 날짜 형식이 올바르지 않아요."
      continue
    }
    if(!String(period.start||"").trim()||!String(period.end||"").trim())return"기간 운영은 시작일과 종료일을 모두 입력해주세요."
    const startAt=operationTimeMs(period.start||"","start")
    const endAt=operationTimeMs(period.end||"","end")
    if(!startAt||!endAt)return"폼 운영 기간의 날짜 형식이 올바르지 않아요."
    if(startAt>endAt)return"폼 운영 기간의 종료일은 시작일보다 빠를 수 없어요."
  }
  if(requireOne&&!validOperationPeriods(enabled).length)return"폼 운영 기간을 1개 이상 추가해주세요."
  return""
}
function primaryOperationRange(periods:OperationPeriod[]){
  const ranges=validOperationPeriods(periods)
  if(!ranges.length)return{start:"",end:""}
  const sorted=[...ranges].sort((a,b)=>(a.startAt||0)-(b.startAt||0))
  return{start:sorted[0].start||"",end:sorted[0].end||""}
}
function dashboardWithOperationPeriods(dashboard:DashboardMeta|undefined,periods?:OperationPeriod[]):DashboardMeta{
  const operationPeriods=periods?periods.map((period,index)=>normalizeOperationPeriod(period,index)).filter(Boolean) as OperationPeriod[]:operationPeriodsFromDashboard(dashboard)
  const primary=primaryOperationRange(operationPeriods)
  return{...(dashboard||{}),operationPeriods,operationStart:primary.start,operationEnd:primary.end}
}
function operationStatusOfDashboard(dashboard?:DashboardMeta|null,fallback?:{start?:string;end?:string}):{status:DashboardManualStatus;hasOperationPeriod:boolean}{
  if(dashboard?.alwaysOpen)return{status:"active",hasOperationPeriod:true}
  const periods=operationPeriodsFromDashboard(dashboard,fallback)
  const ranges=validOperationPeriods(periods)
  if(ranges.length){
    const now=Date.now()
    if(ranges.some(range=>(!range.startAt||now>=range.startAt)&&(!range.endAt||now<=range.endAt)))return{status:"active",hasOperationPeriod:true}
    if(ranges.some(range=>range.startAt&&now<range.startAt))return{status:"draft",hasOperationPeriod:true}
    return{status:"closed",hasOperationPeriod:true}
  }
  return{status:dashboard?.manualStatus||"draft",hasOperationPeriod:false}
}
function OperationPeriodsEditor({periods,onChange,disabled,A,compact=false}:{periods:OperationPeriod[];onChange:(next:OperationPeriod[])=>void;disabled?:boolean;A:AT;compact?:boolean}){
  const update=(id:string,patch:Partial<OperationPeriod>)=>onChange(periods.map(period=>period.id===id?{...period,...patch}:period))
  const remove=(id:string)=>onChange(periods.filter(period=>period.id!==id))
  const add=(type:OperationPeriodType)=>onChange([...periods,makeOperationPeriod(type)])
  // compact은 파란 안내 박스 안에서 쓰이므로 카드/필드 배경을 뒤집어 대비를 유지한다.
  const cardBg=compact?A.card:panelFieldBg(A)
  const fieldBg=compact?panelFieldBg(A):A.card
  const h=compact?34:38
  const inputStyle={minWidth:0,width:"100%",height:h,padding:"0 11px",borderRadius:9,border:"none",background:fieldBg,color:A.t1,fontFamily:FONT,fontSize:compact?12:12.5,boxSizing:"border-box" as const}
  const rowLabel:React.CSSProperties={fontSize:11.5,fontWeight:600,color:A.t3,fontFamily:FONT,width:30,flexShrink:0}
  return <div style={{display:"flex",flexDirection:"column" as const,gap:9,opacity:disabled?0.55:1}}>
    {periods.length===0&&<div style={{padding:12,borderRadius:11,border:"none",background:cardBg,color:A.t3,fontSize:12.5,lineHeight:1.5}}>아직 추가된 운영 기간이 없어요.</div>}
    {periods.map((period,index)=>{
      const setType=(type:OperationPeriodType)=>update(period.id,{type,date:type==="single"?(period.date||String(period.start||"").slice(0,10)):"",start:type==="range"?(period.start||period.date||""):"",end:type==="range"?(period.end||period.date||""):""})
      return <div key={period.id} style={{padding:10,borderRadius:11,border:"none",background:cardBg,display:"flex",flexDirection:"column" as const,gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <PanelSegment inline value={period.type==="single"?"single":"range"} onChange={v=>setType(v as OperationPeriodType)} A={A}
            height={compact?26:28} fontSize={12.5} trackBg={A===ALT?"#E7EAEF":A.bg}
            options={[{value:"range",label:"기간"},{value:"single",label:"단일 날짜"}]}/>
          <div style={{flex:1}}/>
          <button disabled={disabled} onClick={()=>remove(period.id)} title="운영 기간 삭제" aria-label="운영 기간 삭제"
            style={{width:30,height:30,borderRadius:8,border:"none",background:"transparent",color:A.t3,cursor:disabled?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0}}
            onMouseEnter={e=>{if(!disabled){(e.currentTarget as HTMLElement).style.background=fieldBg;(e.currentTarget as HTMLElement).style.color=A.red}}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color=A.t3}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M9.5 4.5h5a1 1 0 0 1 1 1V7h-7V5.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M6 7.5h12l-.85 11.1a1.5 1.5 0 0 1-1.5 1.4H8.35a1.5 1.5 0 0 1-1.5-1.4L6 7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <input disabled={disabled} value={period.label||""} onChange={e=>update(period.id,{label:e.target.value})} placeholder={`운영 기간 이름 (예: ${index+1}차)`} style={inputStyle}/>
        {period.type==="single"
          ? <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={rowLabel}>날짜</span>
              <input type="date" disabled={disabled} value={period.date||""} onChange={e=>update(period.id,{date:e.target.value})} style={inputStyle}/>
            </div>
          : <>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={rowLabel}>시작</span>
                <input type="datetime-local" step={60} disabled={disabled} value={operationInputValue(period.start||"","start")} onChange={e=>update(period.id,{start:e.target.value})} style={inputStyle}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={rowLabel}>종료</span>
                <input type="datetime-local" step={60} disabled={disabled} value={operationInputValue(period.end||"","end")} onChange={e=>update(period.id,{end:e.target.value})} style={inputStyle}/>
              </div>
            </>}
      </div>
    })}
    <button disabled={disabled} onClick={()=>add("range")}
      style={{width:"100%",height:compact?34:38,borderRadius:9,border:`1.5px solid ${disabled?A.border2:A.blue}`,background:compact?A.card:A.card,color:disabled?A.t3:A.blue,fontFamily:FONT,fontSize:12.5,fontWeight:700,cursor:disabled?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      기간 추가
    </button>
  </div>
}
function formTrashedAtOf(item:any){
  return item?.config?.dashboard?.formTrashedAt||item?.dashboard_meta?.formTrashedAt||""
}
function isFormTrashed(item:any){
  return !!formTrashedAtOf(item)
}
function GearIcon({size=16}:{size?:number}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/>
  </svg>
}
function LockIcon({size=13}:{size?:number}){
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
}
function DragHandleIcon({size=14}:{size?:number}){
  return <svg width={size} height={size} viewBox="0 0 10 14" fill="none" aria-hidden="true">
    <circle cx="3" cy="2.5" r="1" fill="currentColor"/><circle cx="7" cy="2.5" r="1" fill="currentColor"/>
    <circle cx="3" cy="7" r="1" fill="currentColor"/><circle cx="7" cy="7" r="1" fill="currentColor"/>
    <circle cx="3" cy="11.5" r="1" fill="currentColor"/><circle cx="7" cy="11.5" r="1" fill="currentColor"/>
  </svg>
}
function postAppsScriptPayload(url:string,payload:any,opts:{allowDirectFallback?:boolean}={}){
  const allowDirectFallback=opts.allowDirectFallback!==false
  const directPost=()=>fetch(url,{method:"POST",mode:"no-cors",body:new URLSearchParams({payload:JSON.stringify(payload)}).toString(),headers:{"content-type":"application/x-www-form-urlencoded;charset=UTF-8"}}).then(()=>{})
  return fetch("/api/google-sheets",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({webhookUrl:url,payload})}).then(async(res)=>{
    if(res.ok){
      const data=await res.json().catch(()=>null)
      const result=data?.appsScriptResponse||data
      if(result?.ok===false)throw Object.assign(new Error(result?.message||result?.error||"Apps Script 전송 실패"),{noDirectFallback:true})
      return result
    }
    if(res.status===404&&allowDirectFallback)return directPost()
    let message="Google Sheets 전송 요청에 실패했어요."
    try{const data=await res.json(); if(data?.error) message=data.error}catch{}
    throw Object.assign(new Error(message),{noDirectFallback:true})
  }).catch(err=>{if(allowDirectFallback&&!err?.noDirectFallback&&typeof window!=="undefined")return directPost();throw err})
}
function withTimeout<T>(promise:PromiseLike<T>,ms:number,message:string):Promise<T>{
  return new Promise((resolve,reject)=>{
    const id=setTimeout(()=>reject(new Error(message)),ms)
    Promise.resolve(promise).then(
      value=>{clearTimeout(id);resolve(value)},
      err=>{clearTimeout(id);reject(err)}
    )
  })
}
async function sha256Text(value:string){
  if(typeof crypto==="undefined"||!crypto.subtle)throw new Error("이 브라우저에서는 비밀번호 보호를 사용할 수 없어요.")
  const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,"0")).join("")
}

type QrFileFormat = "png"|"svg"|"jpg"
type QrVersionInfo = { version:number; align:number[]; ecc:number; maxBytes:number; blocks:{count:number;data:number}[] }
const QR_VERSION_INFO:QrVersionInfo[]=[
  {version:1,align:[],ecc:7,maxBytes:17,blocks:[{count:1,data:19}]},
  {version:2,align:[6,18],ecc:10,maxBytes:32,blocks:[{count:1,data:34}]},
  {version:3,align:[6,22],ecc:15,maxBytes:53,blocks:[{count:1,data:55}]},
  {version:4,align:[6,26],ecc:20,maxBytes:78,blocks:[{count:1,data:80}]},
  {version:5,align:[6,30],ecc:26,maxBytes:106,blocks:[{count:1,data:108}]},
  {version:6,align:[6,34],ecc:18,maxBytes:134,blocks:[{count:2,data:68}]},
  {version:7,align:[6,22,38],ecc:20,maxBytes:154,blocks:[{count:2,data:78}]},
  {version:8,align:[6,24,42],ecc:24,maxBytes:192,blocks:[{count:2,data:97}]},
  {version:9,align:[6,26,46],ecc:30,maxBytes:230,blocks:[{count:2,data:116}]},
  {version:10,align:[6,28,50],ecc:18,maxBytes:271,blocks:[{count:2,data:68},{count:2,data:69}]},
  {version:11,align:[6,30,54],ecc:20,maxBytes:321,blocks:[{count:4,data:81}]},
  {version:12,align:[6,32,58],ecc:24,maxBytes:367,blocks:[{count:2,data:92},{count:2,data:93}]},
  {version:13,align:[6,34,62],ecc:26,maxBytes:425,blocks:[{count:4,data:107}]},
  {version:14,align:[6,26,46,66],ecc:30,maxBytes:458,blocks:[{count:3,data:115},{count:1,data:116}]},
  {version:15,align:[6,26,48,70],ecc:22,maxBytes:520,blocks:[{count:5,data:87},{count:1,data:88}]},
  {version:16,align:[6,26,50,74],ecc:24,maxBytes:586,blocks:[{count:5,data:98},{count:1,data:99}]},
  {version:17,align:[6,30,54,78],ecc:28,maxBytes:644,blocks:[{count:1,data:107},{count:5,data:108}]},
  {version:18,align:[6,30,56,82],ecc:30,maxBytes:718,blocks:[{count:5,data:120},{count:1,data:121}]},
  {version:19,align:[6,30,58,86],ecc:28,maxBytes:792,blocks:[{count:3,data:113},{count:4,data:114}]},
  {version:20,align:[6,34,62,90],ecc:28,maxBytes:858,blocks:[{count:3,data:107},{count:5,data:108}]},
]
const QR_GF_EXP=(()=>{const exp=new Array<number>(512).fill(0);let x=1;for(let i=0;i<255;i++){exp[i]=x;x<<=1;if(x&0x100)x^=0x11D}for(let i=255;i<512;i++)exp[i]=exp[i-255];return exp})()
const QR_GF_LOG=(()=>{const log=new Array<number>(256).fill(0);for(let i=0;i<255;i++)log[QR_GF_EXP[i]]=i;return log})()
const qrRsGeneratorCache:Record<number,number[]>={}
function qrGfMul(a:number,b:number){return a===0||b===0?0:QR_GF_EXP[QR_GF_LOG[a]+QR_GF_LOG[b]]}
function qrAppendBits(bits:number[],value:number,len:number){for(let i=len-1;i>=0;i--)bits.push((value>>>i)&1)}
function qrRsGenerator(degree:number){
  if(qrRsGeneratorCache[degree])return qrRsGeneratorCache[degree]
  let poly=[1]
  for(let i=0;i<degree;i++){
    const next=new Array<number>(poly.length+1).fill(0)
    for(let j=0;j<poly.length;j++){
      next[j]^=poly[j]
      next[j+1]^=qrGfMul(poly[j],QR_GF_EXP[i])
    }
    poly=next
  }
  qrRsGeneratorCache[degree]=poly
  return poly
}
function qrRsRemainder(data:number[],degree:number){
  const gen=qrRsGenerator(degree)
  const rem=new Array<number>(degree).fill(0)
  for(const byte of data){
    const factor=byte^rem.shift()!
    rem.push(0)
    for(let i=0;i<degree;i++)rem[i]^=qrGfMul(gen[i+1],factor)
  }
  return rem
}
function qrFormatBits(mask:number){
  const levelBits=1 // L
  const data=(levelBits<<3)|mask
  let rem=data
  for(let i=0;i<10;i++)rem=(rem<<1)^(((rem>>>9)&1)*0x537)
  return ((data<<10)|rem)^0x5412
}
function qrVersionBits(version:number){
  let rem=version
  for(let i=0;i<12;i++)rem=(rem<<1)^(((rem>>>11)&1)*0x1F25)
  return (version<<12)|rem
}
function qrMask(mask:number,x:number,y:number){
  if(mask===0)return ((x+y)&1)===0
  return false
}
function makeQrMatrix(text:string){
  const bytes=Array.from(new TextEncoder().encode(text))
  const info=QR_VERSION_INFO.find(v=>bytes.length<=v.maxBytes)
  if(!info)throw new Error("QR로 만들 URL이 너무 길어요. 슬러그나 배포 URL을 조금 짧게 줄여주세요.")
  const size=17+info.version*4
  const modules=Array.from({length:size},()=>Array<boolean>(size).fill(false))
  const reserved=Array.from({length:size},()=>Array<boolean>(size).fill(false))
  const set=(x:number,y:number,dark:boolean,lock=true)=>{if(x>=0&&x<size&&y>=0&&y<size){modules[y][x]=dark;if(lock)reserved[y][x]=true}}
  const reserve=(x:number,y:number)=>{if(x>=0&&x<size&&y>=0&&y<size)reserved[y][x]=true}
  const bit=(value:number,i:number)=>((value>>>i)&1)!==0

  const drawFinder=(x:number,y:number)=>{
    for(let dy=-1;dy<=7;dy++)for(let dx=-1;dx<=7;dx++){
      const xx=x+dx,yy=y+dy
      const border=dx===-1||dx===7||dy===-1||dy===7
      const dark=!border&&(dx===0||dx===6||dy===0||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4))
      set(xx,yy,dark,true)
    }
  }
  const drawAlignment=(cx:number,cy:number)=>{
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
      const dist=Math.max(Math.abs(dx),Math.abs(dy))
      set(cx+dx,cy+dy,dist===2||dist===0,true)
    }
  }
  drawFinder(0,0);drawFinder(size-7,0);drawFinder(0,size-7)
  for(let i=8;i<size-8;i++){set(i,6,i%2===0,true);set(6,i,i%2===0,true)}
  for(const y of info.align)for(const x of info.align){
    const nearFinder=(x===6&&y===6)||(x===6&&y===size-7)||(x===size-7&&y===6)
    if(!nearFinder)drawAlignment(x,y)
  }
  for(let i=0;i<9;i++){if(i!==6){reserve(8,i);reserve(i,8)}}
  for(let i=0;i<8;i++){reserve(size-1-i,8);reserve(8,size-1-i)}
  if(info.version>=7){
    for(let i=0;i<18;i++){
      const a=size-11+(i%3),b=Math.floor(i/3)
      reserve(a,b);reserve(b,a)
    }
  }
  set(8,size-8,true,true)

  const totalData=info.blocks.reduce((sum,b)=>sum+b.count*b.data,0)
  const bits:number[]=[]
  qrAppendBits(bits,0b0100,4)
  qrAppendBits(bits,bytes.length,info.version>=10?16:8)
  for(const byte of bytes)qrAppendBits(bits,byte,8)
  const maxBits=totalData*8
  qrAppendBits(bits,0,Math.min(4,Math.max(0,maxBits-bits.length)))
  while(bits.length%8!==0)bits.push(0)
  const data:number[]=[]
  for(let i=0;i<bits.length;i+=8)data.push(bits.slice(i,i+8).reduce((v,b)=>(v<<1)|b,0))
  for(let pad=0;data.length<totalData;pad++)data.push(pad%2===0?0xEC:0x11)

  const blocks:{data:number[];ecc:number[]}[]=[]
  let offset=0
  for(const group of info.blocks){
    for(let i=0;i<group.count;i++){
      const chunk=data.slice(offset,offset+group.data)
      offset+=group.data
      blocks.push({data:chunk,ecc:qrRsRemainder(chunk,info.ecc)})
    }
  }
  const codewords:number[]=[]
  const maxDataLen=Math.max(...blocks.map(b=>b.data.length))
  for(let i=0;i<maxDataLen;i++)for(const block of blocks)if(i<block.data.length)codewords.push(block.data[i])
  for(let i=0;i<info.ecc;i++)for(const block of blocks)codewords.push(block.ecc[i])
  const allBits:number[]=[]
  for(const cw of codewords)qrAppendBits(allBits,cw,8)

  let bitIndex=0
  let upward=true
  for(let right=size-1;right>=1;right-=2){
    if(right===6)right--
    for(let vert=0;vert<size;vert++){
      const y=upward?size-1-vert:vert
      for(let dx=0;dx<2;dx++){
        const x=right-dx
        if(!reserved[y][x]){
          let dark=bitIndex<allBits.length?allBits[bitIndex++]===1:false
          if(qrMask(0,x,y))dark=!dark
          set(x,y,dark,true)
        }
      }
    }
    upward=!upward
  }

  const format=qrFormatBits(0)
  for(let i=0;i<=5;i++)set(8,i,bit(format,i),true)
  set(8,7,bit(format,6),true)
  set(8,8,bit(format,7),true)
  set(7,8,bit(format,8),true)
  for(let i=9;i<15;i++)set(14-i,8,bit(format,i),true)
  for(let i=0;i<8;i++)set(size-1-i,8,bit(format,i),true)
  for(let i=8;i<15;i++)set(8,size-15+i,bit(format,i),true)
  set(8,size-8,true,true)
  if(info.version>=7){
    const ver=qrVersionBits(info.version)
    for(let i=0;i<18;i++){
      const a=size-11+(i%3),b=Math.floor(i/3)
      set(a,b,bit(ver,i),true);set(b,a,bit(ver,i),true)
    }
  }
  return modules
}
function safeMakeQrMatrix(text:string){
  try{return text?makeQrMatrix(text):null}catch{return null}
}
function qrMatrixToSvgMarkup(matrix:boolean[][],px=1024){
  const margin=4
  const n=matrix.length+margin*2
  const path:string[]=[]
  matrix.forEach((row,y)=>row.forEach((dark,x)=>{if(dark)path.push(`M${x+margin} ${y+margin}h1v1h-1z`)}))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="#fff"/><path d="${path.join("")}" fill="#000"/></svg>`
}
function compactQrCode(input:string){
  let a=0x811c9dc5,b=0x9e3779b9
  for(let i=0;i<input.length;i++){
    const c=input.charCodeAt(i)
    a^=c
    a=Math.imul(a,0x01000193)>>>0
    b=(Math.imul(b^c,0x85ebca6b)+i)>>>0
  }
  return `${a.toString(36)}${b.toString(36)}`.replace(/[^a-z0-9]/gi,"").slice(0,12).toLowerCase()
}
function compactFormId(id:string){
  const hex=(id||"").replace(/-/g,"")
  if(!/^[0-9a-f]{32}$/i.test(hex))return ""
  let raw=""
  for(let i=0;i<hex.length;i+=2)raw+=String.fromCharCode(parseInt(hex.slice(i,i+2),16))
  return btoa(raw).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")
}
function safeDownloadName(name:string){
  return (name||"catchform").trim().replace(/[\\/:*?"<>|\s]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")||"catchform"
}
function downloadBlobFile(blob:Blob,fileName:string){
  const url=URL.createObjectURL(blob)
  const a=document.createElement("a")
  a.href=url
  a.download=fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}
function downloadQrFile(text:string,baseName:string,format:QrFileFormat){
  const matrix=makeQrMatrix(text)
  const fileBase=safeDownloadName(baseName)
  if(format==="svg"){
    downloadBlobFile(new Blob([qrMatrixToSvgMarkup(matrix)],{type:"image/svg+xml;charset=utf-8"}),`${fileBase}.svg`)
    return
  }
  const margin=4,n=matrix.length+margin*2,modulePx=48,size=n*modulePx
  const canvas=document.createElement("canvas")
  canvas.width=size;canvas.height=size
  const ctx=canvas.getContext("2d")
  if(!ctx)throw new Error("QR 이미지를 만들 수 없어요.")
  ctx.fillStyle="#fff";ctx.fillRect(0,0,size,size)
  ctx.fillStyle="#000"
  matrix.forEach((row,y)=>row.forEach((dark,x)=>{if(dark)ctx.fillRect((x+margin)*modulePx,(y+margin)*modulePx,modulePx,modulePx)}))
  canvas.toBlob(blob=>{if(blob)downloadBlobFile(blob,`${fileBase}.${format}`)},format==="jpg"?"image/jpeg":"image/png",1)
}

// ─── Static data ──────────────────────────────────────────────────────────
const CONSENT_TYPES = [
  {key:"privacy_policy",    label:"개인정보처리방침",        answerKey:"privacy_policy_consent",    isPrivacy:false},
  {key:"privacy_consent",   label:"개인정보 수집 및 이용동의", answerKey:"privacy_consent",            isPrivacy:true},
  {key:"terms",             label:"서비스 이용약관",          answerKey:"terms_consent",              isPrivacy:false},
  {key:"marketing_consent", label:"마케팅 정보 수신 동의",    answerKey:"marketing_consent",          isPrivacy:false},
]
const ATTRIBUTION_RESPONSE_FIELDS = [
  {id:"__attr_utm_source",answerKey:"utm_source",label:"utm_source"},
  {id:"__attr_utm_medium",answerKey:"utm_medium",label:"utm_medium"},
  {id:"__attr_utm_campaign",answerKey:"utm_campaign",label:"utm_campaign"},
  {id:"__attr_utm_content",answerKey:"utm_content",label:"utm_content"},
  {id:"__attr_utm_term",answerKey:"utm_term",label:"utm_term"},
  {id:"__attr_landing_page",answerKey:"landing_page",label:"landing_page"},
  {id:"__attr_referrer",answerKey:"referrer",label:"referrer"},
  {id:"__attr_fbclid",answerKey:"fbclid",label:"fbclid"},
  {id:"__attr_gclid",answerKey:"gclid",label:"gclid"},
]
const CONSENT_POLICY_URLS: Record<string,Record<string,string>> = {
  INSIDEOUT: {
    privacy_policy: "https://insideout.or.kr/signup/privacy-policy",
    privacy_consent: "https://insideout.or.kr/signup/privacy-consent",
    terms: "https://insideout.or.kr/signup/terms",
    marketing_consent: "https://insideout.or.kr/signup/marketing-consent",
  },
  SNIPERFACTORY: {
    privacy_policy: "https://sniperfactory.com/terms/privacy",
    privacy_consent: "https://sniperfactory.com/terms/consent",
    terms: "https://sniperfactory.com/terms/service",
    marketing_consent: "https://sniperfactory.com/terms/marketing",
  },
}
const consentPolicyBrandKey = (brand:string) => String(brand||"").toUpperCase()==="SNIPERFACTORY" ? "SNIPERFACTORY" : "INSIDEOUT"
const consentTypeFromTitle = (title:string) => {
  const text=String(title||"")
  if(text.includes("처리방침"))return"privacy_policy"
  if(text.includes("수집")||text.includes("이용동의"))return"privacy_consent"
  if(text.includes("서비스")||text.includes("약관"))return"terms"
  if(text.includes("마케팅"))return"marketing_consent"
  return""
}
const consentLabelForType = (type:string) => CONSENT_TYPES.find(c=>c.key===type)?.label || "법적 문서"
const policyUrlForConsent = (type:string,brand?:string) => CONSENT_POLICY_URLS[consentPolicyBrandKey(brand||"")][type] || ""

// ─── Default guide content ────────────────────────────────────────────────
const DEFAULT_GUIDE_SECTIONS = [
  {
    title:"폼 만들기",
    desc:"새 폼을 만드는 방법을 안내해 드립니다.",
    steps:[
      "왼쪽 하단 '+ 새 폼 만들기' 버튼을 클릭하세요.",
      "브랜드를 선택하세요. (스나이퍼팩토리 / 인사이드아웃)",
      "폼 형식을 선택하세요. (사전알림, 교육과정, 교육사업, 참여기업, 채용, 빈 템플릿)",
      "기본 정보, 질문, 동의 항목, CTA 등 각 섹션을 편집하세요.",
    ]
  },
  {
    title:"질문 추가하기",
    desc:"왼쪽 미리보기 하단의 '+ 질문 추가' 버튼으로 질문을 추가할 수 있습니다.",
    steps:[
      "단답형 / 장문형: 자유 입력 필드를 추가합니다.",
      "이름 / 전화번호 / 이메일: DB 컬럼과 연결된 전용 유형입니다. 이 유형을 사용해야 데이터가 올바르게 저장됩니다.",
      "유입경로: 기본 유입경로 옵션이 자동으로 설정됩니다.",
      "단일선택 / 복수선택 / 드롭다운: 선택형 질문을 추가합니다.",
      "답변 옵션의 더블클릭으로 내용을 수정할 수 있습니다.",
    ]
  },
  {
    title:"폼 저장 및 배포",
    desc:"완성된 폼을 저장하고 링크를 공유하세요.",
    steps:[
      "우측 상단 '저장' 버튼으로 폼을 처음 저장합니다. 이름과 슬러그를 입력하세요.",
      "저장 후에는 내용이 변경되면 2초 후 자동으로 저장됩니다.",
      "'폼 열기' 버튼으로 실제 폼 페이지를 확인할 수 있습니다.",
      "스팩스페이스 폼 URL 형식: https://catchform.vercel.app/form/{슬러그}",
    ]
  },
  {
    title:"동의 항목 설정",
    desc:"개인정보 수집 및 마케팅 동의 등을 설정합니다.",
    steps:[
      "왼쪽 사이드바 '동의' 섹션에서 동의 항목을 추가/편집하세요.",
      "'동의 유형 선택' 드롭다운에서 개인정보 수집, 마케팅 수신 등 유형을 선택하세요.",
      "개인정보 수집 및 이용동의는 DB의 privacy_consent 컬럼에 저장됩니다.",
      "마케팅 정보 수신 동의 시 users 테이블의 sms_consent가 true로 업데이트됩니다.",
    ]
  },
  {
    title:"폼 유형 선택",
    desc:"브랜드와 목적에 맞는 기본 폼 유형을 선택해 시작하세요.",
    steps:[
      "새 폼 만들기에서 브랜드를 선택한 뒤 사전 알림, 교육과정, 참여기업, 채용 등 기본 유형을 고르세요.",
      "선택한 유형의 기본 질문과 디자인이 자동으로 적용되며, 이후 빌더에서 자유롭게 수정할 수 있습니다.",
    ]
  },
]
function FlickMark({size=32}:{size?:number}){
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
    <rect width="48" height="48" rx="14" fill="#3182F6"/>
    <rect x="9" y="12" width="18" height="4" rx="2" fill="white"/>
    <rect x="9" y="20" width="30" height="4" rx="2" fill="white" opacity="0.38"/>
    <rect x="9" y="28" width="30" height="4" rx="2" fill="white" opacity="0.38"/>
    <path d="M31 38 L39 33 L31 28" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
}

function FlickWordmark({size=20,dark=false}:{size?:number;dark?:boolean}){
  const col=dark?"#F3F4F6":"#191919"
  return <div style={{display:"flex",alignItems:"baseline",gap:0}}>
    <span style={{fontSize:size,fontWeight:600,color:col,letterSpacing:"-0.5px",lineHeight:1}}>Catch</span>
    <span style={{fontSize:size,fontWeight:500,color:col,letterSpacing:"-0.5px",lineHeight:1,marginLeft:4}}>Form</span>
  </div>
}

// ─── Brand logos ─────────────────────────────────────────────────────────
function IOLogo({height=28,dark=false}:{height?:number;dark?:boolean}){
  const fill=dark?"#FFFFFF":"#18181B"
  const ratio=69/407
  const w=height/ratio
  return <svg width={w} height={height} viewBox="0 0 407 69" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
    <path d="M11.0334 67.389H0.00012207V0.547241H11.0334V67.389Z" fill={fill}/>
    <path d="M272.006 18.5732C286.106 18.5734 296.927 29.5505 295.963 43.3428C294.992 57.2119 282.645 68.1971 268.536 68.1972C254.505 68.1968 243.704 57.2035 244.673 43.3428C245.636 29.5589 257.984 18.5736 272.006 18.5732ZM271.238 29.5796C263.076 29.5799 256.231 35.8426 255.707 43.3419C255.181 50.8625 261.168 57.1905 269.307 57.1909C277.542 57.1907 284.405 50.8524 284.93 43.3419C285.454 35.8527 279.496 29.5797 271.238 29.5796Z" fill={fill}/>
    <path d="M214.087 18.3149C228.991 18.3153 240.301 31.2331 238.812 45.7209L238.501 48.7471H201.278C203.055 52.9303 206.714 55.6091 211.033 56.6627C216.644 58.0313 222.988 56.54 227.077 52.1719L229.051 50.0618L238.092 56.2367L235.594 59.0965C228.083 67.694 216.516 69.8776 206.925 66.9592C197.225 64.0074 189.171 55.7011 189.171 43.2304C189.171 29.4379 200.294 18.3149 214.087 18.3149ZM214.087 29.3483C208.368 29.3483 203.484 32.7902 201.326 37.7138H226.801C224.666 32.7748 219.715 29.3485 214.087 29.3483Z" fill={fill}/>
    <path d="M122.547 13.5535C126.15 13.5535 129.093 10.7314 129.093 7.09336C129.093 3.54362 126.388 0.726641 122.887 0.554555L122.547 0.547241C119.023 0.547241 116.263 3.30853 116.094 6.75691L116.087 7.09336L116.094 7.42615C116.267 10.8482 119.081 13.5535 122.547 13.5535Z" fill={fill}/>
    <path d="M117.028 18.0591C118.618 19.1599 120.511 19.7989 122.546 19.7989C124.56 19.7989 126.456 19.1778 128.061 18.0962L128.061 67.3891H117.028L117.028 18.0591Z" fill={fill}/>
    <path d="M90.4834 17.6295C97.0321 17.774 101.866 19.8552 105.09 21.9668C106.692 23.0162 107.887 24.0671 108.699 24.8778C109.106 25.2836 109.42 25.6324 109.641 25.8926C109.751 26.0224 109.839 26.1313 109.904 26.2144C109.937 26.256 109.965 26.2919 109.986 26.3205C109.997 26.3346 110.008 26.3463 110.016 26.3571L110.034 26.3827L112.091 29.1821L103.318 35.24L101.332 33.2543C101.251 33.1734 101.191 33.1044 101.177 33.0879C101.153 33.0607 101.133 33.0389 101.124 33.0275C101.105 33.0054 101.089 32.985 101.083 32.9781C101.064 32.955 101.061 32.9513 101.047 32.9343C101.027 32.9099 100.997 32.8745 100.957 32.8282C100.876 32.7348 100.741 32.5853 100.549 32.3985C100.165 32.0241 99.5525 31.494 98.6916 30.9485C97.0966 29.9378 94.5874 28.8334 90.9698 28.608L90.231 28.5751H89.7227C87.8225 28.5751 85.5619 28.9839 83.8861 29.8258C82.276 30.6346 81.7257 31.5233 81.679 32.479C81.7029 33.4278 82.2682 34.3932 84.2189 35.3644C85.9536 36.228 88.1886 36.7504 90.1908 37.0283L91.0319 37.1344L91.063 37.1362L91.0941 37.1399C95.1484 37.6574 100.048 38.5049 104.003 40.6726C106.031 41.784 107.919 43.299 109.31 45.3902C110.628 47.3728 111.395 49.7161 111.53 52.4099L111.548 52.9548V52.9694C111.611 57.5863 108.958 60.9141 105.942 63.0519C102.959 65.1654 99.2806 66.4001 96.1719 66.9741L96.128 66.9814L96.086 66.9887C92.4742 67.559 88.5119 67.5725 84.6742 66.687C78.6123 65.3145 72.8154 61.7955 69.6931 55.3428L68.1534 52.1575L78.3584 47.8148L79.7774 50.6508C81.1773 53.45 83.8527 55.202 87.1975 55.9919C89.4684 56.4863 91.8683 56.4983 94.2666 56.1236C95.5678 55.9103 97.4022 55.3721 98.805 54.573C99.5029 54.1754 99.9389 53.8007 100.169 53.5125C100.275 53.3792 100.317 53.2909 100.332 53.251C100.344 53.2187 100.345 53.2009 100.345 53.1778V53.1449C100.333 52.2405 100.07 51.6714 99.7083 51.2286C99.2988 50.7281 98.6167 50.2224 97.5634 49.7603C95.3731 48.7996 92.4791 48.3881 89.6477 48.0342C85.8394 47.5738 81.2147 46.4536 77.4588 44.1523C73.5995 41.7873 70.3557 37.936 70.4738 32.2595V32.1882L70.4757 32.1315C70.6517 26.8494 73.7092 23.1154 77.4625 20.8422C81.1396 18.6152 85.6786 17.6296 89.7227 17.6295H90.4834Z" fill={fill}/>
    <path d="M29.224 22.3724C32.8326 19.8245 37.1542 18.3149 41.8189 18.3149C55.6891 18.3149 64.9314 30.7472 64.9314 43.2304V67.3724H53.8981V43.2304C53.8981 35.767 48.5205 29.3483 41.561 29.3483C34.6017 29.3485 29.224 35.7672 29.224 43.2304V67.3724H18.1907V18.3149H29.224V22.3724Z" fill={fill}/>
    <path d="M184.762 67.373H173.728V63.6992C169.436 66.5943 164.329 68.1463 159.075 68.1465C145.457 68.1465 133.472 57.537 133.472 43.2314C133.472 29.0283 145.354 18.3154 159.075 18.3154C164.526 18.3156 169.567 19.9896 173.728 22.8066V0.547852H184.762V67.373ZM159.076 29.3486C150.937 29.3488 144.507 35.6913 144.507 43.2305C144.507 51.0298 151.192 57.1121 159.076 57.1123C166.96 57.112 173.644 51.0297 173.644 43.2305C173.644 35.681 167.29 29.3489 159.076 29.3486Z" fill={fill}/>
    <path d="M370.225 19.0507C368.973 21.1255 373.167 24.703 383.285 25.1319C398.374 25.7715 400.537 23.855 404.514 22.1245" stroke="#EE5347" strokeWidth="7.78952"/>
    <path d="M383.078 0.0234375C384.583 0.123777 386.062 0.581341 387.375 1.49414C388.847 2.51852 389.811 3.90581 390.426 5.30469C391.592 7.95634 391.729 11.1603 391.498 14.1562C391.024 20.3035 388.778 28.0991 385.779 35.5879C383.162 42.1209 379.844 48.7269 376.304 54.1758C376.376 54.2585 376.442 54.3447 376.514 54.4199C378.693 56.69 380.355 57.8464 381.819 58.3945C383.168 58.8995 384.748 59.0377 387.078 58.4658C391.157 57.4641 391.883 54.1465 392.894 51.7441L401.524 55.377C401.523 55.3797 401.518 55.3948 401.51 55.4141C401.499 55.4432 401.484 55.4828 401.464 55.5352C401.422 55.6506 401.378 55.7696 401.312 55.9512C401.188 56.2901 401.02 56.7405 400.812 57.2451C400.396 58.2553 399.794 59.5345 398.907 60.8545C397.087 63.56 394.094 66.381 389.308 67.5557C385.532 68.4824 381.987 68.4529 378.538 67.1621C375.664 66.0865 373.182 64.249 370.865 62.0059C368.63 59.604 366.745 56.6512 365.248 53.2822C364.674 51.7298 364.214 50.1133 363.853 48.4941C362.054 40.4243 362.916 28.9124 365.568 19.4844C366.903 14.7391 368.79 10.1509 371.307 6.6416C373.769 3.21003 377.456 0.000222284 382.431 0L383.078 0.0234375ZM360.178 58.1553C361.633 61.0014 363.38 63.6374 365.432 65.9561C363.721 66.9657 361.77 67.6906 359.646 67.6904V58.3311C359.666 58.3295 359.834 58.3106 360.178 58.1553ZM381.977 9.43164C380.89 8.94875 379.693 10.369 378.353 12.2373C376.707 14.5317 375.756 17.842 374.581 22.0186C372.695 28.7228 371.937 36.3582 372.399 42.29C374.093 39.062 375.692 35.5982 377.089 32.1084C379.93 25.015 382.03 18.1701 382.524 14.1562C382.747 12.3405 383.064 9.91486 381.977 9.43164Z" fill="#EE5347"/>
    <path d="M343.441 14.9679C345.384 14.4971 347.379 14.436 349.301 14.9679C351.544 15.5894 353.362 16.9335 354.654 18.715C357.121 22.1174 357.484 26.746 356.729 31.1496C355.717 37.0545 352.516 43.8727 346.898 50.426C349.302 53.2733 352.291 55.7238 355.508 57.1076C357.355 57.9021 359.237 58.3317 361.123 58.3322C361.15 58.3298 361.321 58.3055 361.659 58.1515C363.113 60.9979 364.86 63.6344 366.912 65.9533C365.18 66.9766 363.229 67.6919 361.12 67.6916C357.794 67.6907 354.658 66.9317 351.809 65.7062C347.242 63.7412 343.313 60.5378 340.24 57.0392C339.979 57.2618 339.712 57.4813 339.445 57.7023L339.446 57.7043C338.614 58.5558 333.56 63.0389 330.546 64.5773C327.077 66.3474 323.243 67.3633 319.348 67.3635C307.434 67.3635 299.39 57.7517 301.47 45.9543L306.214 19.051H317.245L312.502 45.9543C311.482 51.7418 315.499 56.4989 321.263 56.4992C327.048 56.4987 330.788 52.2848 334.235 49.8537C334.474 49.6489 334.711 49.4448 334.943 49.2394C334.013 47.1274 333.285 43.2478 333.052 40.8937C332.654 36.882 333.055 30.7982 334.34 26.3303C334.98 24.1026 335.841 21.8499 336.998 19.9592C338.091 18.1723 339.866 16.0283 342.614 15.1945L343.441 14.9679ZM346.758 23.8185C346.54 23.7582 346.138 23.7192 345.722 23.9914C345.42 24.1896 345.25 24.4097 344.984 24.8449C344.428 25.7542 343.851 27.1326 343.338 28.9162C342.315 32.4722 341.777 36.8087 341.777 40.1388C341.777 40.5169 341.845 40.995 341.978 41.5549C345.2 37.1131 346.932 32.894 347.502 29.5685C348.048 26.3859 347.562 24.8459 347.378 24.4738C347.194 24.1032 346.975 23.8791 346.758 23.8185Z" fill={fill}/>
  </svg>
}

function SFLogo({height=28,dark=false}:{height?:number;dark?:boolean}){
  const textFill=dark?"#FFFFFF":"#323232"
  const ratio=15.52/119.78
  const w=height/ratio
  return <svg width={w} height={height} viewBox="0 0 119.78 15.52" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
    <path fill={textFill} d="M119.78,3.71l-3.75,8.09-.5,1.1c-.3.66-.75,1.18-1.36,1.57-.6.39-1.27.58-2.01.58h-.86l.49-1.94h.47c.31,0,.6-.09.87-.26s.47-.4.6-.7l.16-.36-3.75-8.09h2.14l2.69,5.79,2.69-5.79h2.14Z"/>
    <path fill={textFill} d="M107.01,4.32c.3-.25.64-.45,1.02-.61.39-.16.83-.24,1.31-.24v1.94c-.65,0-1.2.23-1.65.68-.45.47-.68,1.02-.68,1.65v4.06h-1.94V3.69h1.94v.63Z"/>
    <path fill={textFill} d="M99.34,5.42c-.65,0-1.2.23-1.65.68-.45.45-.68,1-.68,1.65s.23,1.18.68,1.63c.22.23.46.4.74.52.29.11.59.16.91.16s.61-.05.89-.16c.28-.12.53-.29.76-.52.45-.45.68-1,.68-1.63s-.23-1.2-.68-1.65c-.47-.45-1.02-.68-1.65-.68ZM99.34,3.48c.59,0,1.15.11,1.67.34.52.22.97.52,1.36.91.39.39.69.84.91,1.36.23.52.34,1.07.34,1.67s-.11,1.13-.34,1.65c-.22.52-.52.97-.91,1.36-.39.39-.84.7-1.36.92-.52.22-1.07.32-1.67.32s-1.15-.11-1.67-.32c-.52-.23-.97-.53-1.36-.92-.39-.39-.7-.84-.92-1.36-.22-.52-.32-1.07-.32-1.65s.11-1.15.32-1.67c.23-.52.53-.97.92-1.36.39-.39.84-.69,1.36-.91.52-.23,1.07-.34,1.67-.34Z"/>
    <path fill={textFill} d="M94.09,11.79h-1.78c-.37,0-.71-.07-1.04-.21-.32-.14-.6-.33-.84-.57-.24-.25-.43-.53-.57-.86-.14-.32-.21-.67-.21-1.04V2.07l1.94-.49v3.09h1.13l.49,1.94h-1.62v2.51c0,.2.07.38.21.52.14.14.31.21.5.21h1.29l.49,1.94Z"/>
    <path fill={textFill} d="M88.21,10.76c-.39.39-.84.7-1.36.92-.52.22-1.07.32-1.67.32s-1.15-.11-1.67-.32c-.52-.23-.97-.53-1.36-.92-.39-.39-.7-.84-.92-1.36-.22-.52-.32-1.07-.32-1.65s.11-1.15.32-1.67c.23-.52.53-.97.92-1.36.39-.39.84-.69,1.36-.91.52-.23,1.07-.34,1.67-.34s1.15.11,1.67.34c.52.22.97.52,1.36.91l-1.38,1.38c-.45-.45-1-.68-1.65-.68s-1.18.23-1.65.68c-.45.45-.68,1-.68,1.65s.23,1.18.68,1.63c.23.23.48.4.76.52.28.11.58.16.89.16.66,0,1.21-.23,1.65-.68l1.38,1.38Z"/>
    <path fill={textFill} d="M79.45,3.69v8.11h-1.94v-4.04c0-.65-.23-1.2-.68-1.65-.45-.45-1-.68-1.65-.68-.31,0-.61.06-.91.18-.28.12-.53.29-.74.5-.45.45-.68,1-.68,1.65s.23,1.18.68,1.63c.22.23.46.4.74.52.29.11.59.16.91.16s.61-.05.87-.16l.7,1.73c-.5.25-1.07.37-1.73.37-.59,0-1.14-.11-1.65-.32-.5-.23-.93-.53-1.29-.92-.37-.39-.65-.84-.86-1.36-.2-.52-.31-1.07-.31-1.65s.1-1.15.31-1.67c.2-.52.49-.97.86-1.36.37-.39.8-.69,1.29-.91.51-.23,1.06-.34,1.65-.34.53,0,1,.08,1.41.24.41.16.77.37,1.08.61v-.65h1.94Z"/>
    <path fill={textFill} d="M69.78,2.41c-.27,0-.52.05-.76.16-.23.1-.43.23-.61.4-.17.17-.31.38-.42.61-.11.23-.16.47-.16.74h1.15l.49,1.94h-1.63v5.52h-1.94v-7.46c.01-.52.11-1.01.31-1.47.19-.47.47-.9.84-1.26.37-.37.79-.65,1.26-.84s.97-.29,1.49-.29v1.94Z"/>
    <path fill={textFill} d="M62.26,4.32c.3-.25.64-.45,1.02-.61.39-.16.83-.24,1.31-.24v1.94c-.65,0-1.2.23-1.65.68-.45.47-.68,1.02-.68,1.65v4.06h-1.94V3.69h1.94v.63Z"/>
    <path fill={textFill} d="M56.72,8.72h-4.24c.11.25.26.47.47.66.23.23.48.4.76.52.28.11.58.16.89.16.44,0,.84-.1,1.18-.31l2.02.81c-.39.45-.86.81-1.41,1.07-.55.25-1.15.37-1.8.37-.59,0-1.15-.11-1.67-.32-.52-.23-.97-.53-1.36-.92-.39-.39-.7-.84-.92-1.36-.22-.52-.32-1.07-.32-1.65s.11-1.15.32-1.67c.23-.52.53-.97.92-1.36.39-.39.84-.69,1.36-.91.52-.23,1.07-.34,1.67-.34s1.15.11,1.67.34c.52.22.97.52,1.36.91.39.39.69.84.91,1.36.23.52.34,1.07.34,1.67,0,.35-.04.67-.11.97h-2.04ZM54.6,5.42c-.63,0-1.18.23-1.65.68-.2.2-.36.43-.47.68h4.24c-.11-.25-.26-.47-.47-.68-.45-.45-1-.68-1.65-.68Z"/>
    <path fill={textFill} d="M45.24,3.48c.59,0,1.14.11,1.63.34.51.22.94.52,1.31.91.37.39.65.84.86,1.36.2.52.31,1.07.31,1.67s-.1,1.13-.31,1.65c-.2.52-.49.97-.86,1.36-.37.39-.8.7-1.31.92-.5.22-1.04.32-1.63.32-.66,0-1.24-.12-1.73-.37l.7-1.73c.26.11.55.16.87.16s.61-.05.89-.16c.28-.12.53-.29.76-.52.45-.45.68-1,.68-1.63s-.23-1.2-.68-1.65c-.47-.45-1.02-.68-1.65-.68s-1.2.23-1.65.68c-.45.45-.68,1-.68,1.65v7.28h-1.94V3.69h1.94v.65c.31-.25.67-.45,1.08-.61.41-.16.88-.24,1.41-.24Z"/>
    <path fill={textFill} d="M36.92,11.79V3.71h1.94v8.09h-1.94ZM36.92.47h1.94v1.94h-1.94V.47Z"/>
    <path fill={textFill} d="M31.63,3.48c.53,0,1.01.1,1.44.31.43.19.8.47,1.1.83.31.35.55.75.71,1.21.17.46.26.96.26,1.49v4.48h-1.94v-4.48c0-.54-.19-.99-.57-1.34-.37-.37-.81-.55-1.33-.55s-.98.18-1.34.55c-.37.37-.55.81-.55,1.34v4.48h-1.94V3.71h1.94v.61c.29-.25.62-.45.99-.6.37-.16.78-.24,1.23-.24Z"/>
    <path fill={textFill} d="M23.09,6.78c.13.03.35.11.65.23.3.12.61.29.92.5.32.2.6.46.84.78.24.31.36.68.36,1.12,0,.38-.06.72-.19,1.04-.12.31-.3.59-.53.83-.24.24-.53.42-.87.55-.35.13-.73.19-1.16.19-.66,0-1.27-.12-1.84-.36-.56-.24-1.01-.53-1.36-.87l1.34-1.34c.28.33.58.55.89.65.32.1.59.15.81.15.33,0,.58-.06.74-.19.16-.13.24-.29.24-.47,0-.13-.05-.24-.16-.34-.11-.1-.24-.18-.39-.24-.14-.06-.29-.11-.44-.15-.15-.04-.27-.08-.37-.11-.13-.04-.35-.12-.66-.23-.3-.11-.61-.26-.94-.47-.31-.2-.59-.46-.83-.78-.24-.31-.36-.69-.36-1.13s.08-.84.23-1.16c.16-.33.37-.61.63-.83.26-.22.56-.37.89-.47.33-.11.68-.16,1.04-.16.55,0,1.01.06,1.39.19.39.13.71.27.95.42.28.18.52.39.71.61l-1.36,1.36c-.22-.28-.45-.49-.71-.61-.26-.13-.53-.19-.83-.19-.23,0-.45.05-.68.16-.22.11-.32.28-.32.52,0,.13.05.24.15.34.1.09.22.16.36.23.14.05.29.1.44.15.16.04.31.08.44.11Z"/>
    <rect fill="#f3bdd6" y="11.56" width="15.58" height="3.95" rx="1.33" ry="1.33"/>
    <rect fill="#4bd6a1" x="-3.25" y="3.25" width="10.46" height="3.95" rx="1.33" ry="1.33" transform="translate(-3.25 7.21) rotate(-90)"/>
    <path fill="#358bfc" d="M6.26,0h0C11.4,0,15.58,4.18,15.58,9.32h0c0,.63-.51,1.14-1.14,1.14H6.26c-.63,0-1.14-.51-1.14-1.14V1.14C5.13.52,5.64,0,6.26,0Z"/>
  </svg>
}

function SfacspaceLogo({height=18,dark=false}:{height?:number;dark?:boolean}){
  return <img src="/sfacspace_logo_black.png" alt="스팩스페이스" style={{display:"block",height,width:"auto",maxWidth:"100%",objectFit:"contain",filter:dark?"brightness(0) invert(1)":"none",flexShrink:0}}/>
}

function BrandLogo({brand,height=18,dark=false}:{brand:string;height?:number;dark?:boolean}){
  if(brand==="INSIDEOUT")return <IOLogo height={height} dark={dark}/>
  if(brand==="SFACSPACE")return <SfacspaceLogo height={height} dark={dark}/>
  return <SFLogo height={height} dark={dark}/>
}

function brandDisplayName(brand:string){
  if(brand==="SNIPERFACTORY")return"스나이퍼팩토리"
  if(brand==="INSIDEOUT")return"인사이드아웃"
  if(brand==="SFACSPACE")return"스팩스페이스"
  return"기타"
}

function canonicalBrand(brand:string):BrandId{
  if(brand==="INSIDEOUT")return"INSIDEOUT"
  if(brand==="SFACSPACE")return"SFACSPACE"
  return"SNIPERFACTORY"
}

// form_configs.brand is a legacy FK column. New UI brands live in config.brand
// while this column keeps a compatible parent value for existing Supabase schemas.
function dbBrandValue(brand:string){
  return canonicalBrand(brand)==="INSIDEOUT"?"INSIDEOUT":"SNIPERFACTORY"
}
function isCompanyApplicationConfig(config:any){
  const formType=String(config?.formType||"")
  if(["edu_biz","company","recruit"].includes(formType))return true
  const fields=Array.isArray(config?.form?.fields)?config.form.fields:[]
  const fieldIds=new Set(fields.map((field:any)=>String(field?.id||"")))
  if(fieldIds.has("company_name")&&(fieldIds.has("industry")||fieldIds.has("program_type")||fieldIds.has("business_type")))return true
  const titleText=`${config?.header?.overline||""} ${config?.header?.title||""}`
  return titleText.includes("참여기업")||titleText.includes("참여 기업")
}
function makeAutoSlug(prefix="form"){
  const safePrefix=String(prefix||"form").replace(/[^a-z0-9-]/gi,"").toLowerCase()||"form"
  return `${safePrefix}-${Date.now()}-${Math.floor(100000+Math.random()*900000)}`
}


const DEFOPTS: Opt[] = [
  {label:"스나이퍼팩토리 SNS 계정",value:"스나이퍼팩토리 SNS 계정",isEtc:false},
  {label:"네이버, 구글 등 검색",value:"네이버, 구글 등 검색",isEtc:false},
  {label:"공모전/대외활동 사이트",value:"공모전/대외활동 사이트",isEtc:false},
  {label:"문자/MMS/메일",value:"문자/MMS/메일",isEtc:false},
  {label:"대학교 취업센터",value:"대학교 취업센터",isEtc:false},
  {label:"사람인/잡코리아 등 채용사이트",value:"사람인/잡코리아 등 채용사이트",isEtc:false},
  {label:"SNS 광고(인스타그램, 페이스북)",value:"SNS 광고(인스타그램, 페이스북)",isEtc:false},
  {label:"링커리어",value:"링커리어",isEtc:false},
  {label:"지인추천",value:"지인추천",isEtc:false},
  {label:"기타",value:"기타",isEtc:true},
]
const DEF: Cfg = {
  header:{imageUrl:"",programId:"",overline:"프로그램 오픈 알림 신청",title:"폼 제목을 입력해주세요.",educationStart:"",educationEnd:"",tuitionFree:true,tuitionFreeText:"수강료 전액 무료",tuitionAmount:"",stipend:"",noticeEnabled:true,noticeIconEnabled:true,noticeIconText:"i",noticeText:"필요한 정보만 간단히 적고, 오픈 소식 가장 먼저 받아보세요."},
  ad:dc(DEFAULT_FORM_AD),
  form:{
    showNum:true,
    dupText:"이미 신청 내역이 있어요. (이메일 또는 휴대폰 번호가 동일해요)",
    pages:1,
    fields:[
      {id:"name",type:"text" as const,label:"이름을 입력해주세요.",placeholder:"예) 홍길동",required:true,page:1},
      {id:"phone",type:"phone" as const,label:"연락 가능한 휴대폰 번호를 입력해 주세요.",placeholder:"예) 010-1234-5678",helper:"* 오픈 알림은 문자로 안내드릴 예정이에요.",required:true,dupCheck:true,page:1},
      {id:"email",type:"email" as const,label:"이메일 주소를 입력해주세요.",placeholder:"예) example@insideout.or.kr",helper:"* 추가 안내 및 상세 정보는 이메일로 받아보실 수 있어요.",required:true,page:1},
      {id:"referral",type:"dropdown" as const,label:"프로그램을 어디에서 알게 되셨나요?",placeholder:"선택해주세요.",required:false,opts:DEFOPTS,etcPh:"기타 경로를 입력해주세요.",page:1},
    ],
  },
  consents:[{enabled:true,required:true,title:"개인정보 수집 및 이용동의",body:"프로그램 오픈 알림 안내를 위해 이름, 연락처, 이메일을 수집하며 해당 목적 외에는 사용되지 않습니다.\n수집된 정보는 알림 발송 후 안전하게 파기됩니다.",checkLabel:"개인정보 수집 및 이용에 동의합니다.",policyUrl:""}],
  cta:{label:"오픈 알림 신청하기",loadLabel:"신청 중...",height:48,bg:"#E85C5C",color:"#FFFFFF"},
  modal:{title:"알림 신청이 완료되었어요!",body:"오픈 소식과 모집 안내를 가장 먼저 전달드릴게요.",btnLabel:"교육과정 더 보러가기",btnUrl:"https://insideout.or.kr/program",btnReplace:false},
  styles:{theme:"light",fieldH:44,qGap:28,maxW:560,labelGap:12,seniorMode:false},
  auth:{enabled:true,loginUrl:"/login",errText:"로그인이 필요해요."},
  integrations:{googleSheets:DEFAULT_GOOGLE_SHEETS,qrLinks:[]},
  brand:"",
  formType:"alert" as const,
  kdtFields:undefined,
}

const KDTOPTS: Opt[] = [
  {label:"스나이퍼팩토리 SNS",value:"스나이퍼팩토리 SNS",isEtc:false},
  {label:"네이버·구글 검색",value:"네이버·구글 검색",isEtc:false},
  {label:"공모전/대외활동 사이트",value:"공모전/대외활동 사이트",isEtc:false},
  {label:"문자/MMS/메일",value:"문자/MMS/메일",isEtc:false},
  {label:"대학교 취업센터",value:"대학교 취업센터",isEtc:false},
  {label:"채용사이트(사람인·잡코리아 등)",value:"채용사이트(사람인·잡코리아 등)",isEtc:false},
  {label:"SNS 광고(인스타·페이스북)",value:"SNS 광고(인스타·페이스북)",isEtc:false},
  {label:"링커리어",value:"링커리어",isEtc:false},
  {label:"지인추천",value:"지인추천",isEtc:false},
  {label:"기타",value:"기타",isEtc:true},
]
const KDT_FIELDS_DEFAULT: KdtField[] = [
  // 1페이지
  {id:"name",label:"성함",type:"text",required:true,page:1,placeholder:"예) 홍길동"},
  {id:"phone",label:"연락처",type:"text",required:true,page:1,placeholder:"예) 010-1234-5678"},
  {id:"birthdate",label:"생년월일",type:"date",required:true,page:1,placeholder:"예) 1998-03-15"},
  {id:"referral",label:"유입 경로",type:"dropdown",required:true,page:1,options:["스나이퍼팩토리 SNS","네이버·구글 검색","공모전/대외활동 사이트","문자/MMS/메일","대학교 취업센터","채용사이트","SNS 광고","링커리어","지인추천","기타"]},
  // 2페이지
  {id:"gender",label:"성별",type:"button_select",required:true,page:2,options:["남성","여성","기타"]},
  {id:"region",label:"현 거주지",type:"dropdown",required:true,page:2,options:["서울 강남구","서울 강동구","서울 강북구","서울 강서구","서울 관악구","서울 광진구","서울 구로구","서울 금천구","서울 노원구","서울 도봉구","서울 동대문구","서울 동작구","서울 마포구","서울 서대문구","서울 서초구","서울 성동구","서울 성북구","서울 송파구","서울 양천구","서울 영등포구","서울 용산구","서울 은평구","서울 종로구","서울 중구","서울 중랑구","경기 수원","경기 성남","경기 용인","경기 고양","경기 부천","경기 안산","경기 안양","경기 남양주","경기 화성","경기 평택","인천","부산","대구","광주","대전","울산","세종","강원","충북","충남","전북","전남","경북","경남","제주","기타"]},
  {id:"edu",label:"최종학력",type:"button_select",required:true,page:2,options:["고등학교 졸업","대학교 재학","대학교 휴학","대학교 졸업","대학원 재학","대학원 졸업","기타"]},
  {id:"semester",label:"학교 재학/휴학 중인 경우 남은 학기",type:"text",required:false,page:2,placeholder:"예) 3학기"},
  {id:"school",label:"학교/전공",type:"dropdown",required:false,page:2,options:["해당없음(졸업)","직접 입력"]},
  {id:"dev_exp",label:"개발 관련 학습 경험",type:"button_select",required:true,page:2,options:["없음","독학","부트캠프","대학 전공","온라인 강의","기타"]},
  {id:"dev_detail",label:"개발 관련 학습/활동 경험 상세",type:"textarea",required:false,page:2,placeholder:"학습 경험이 있다면 구체적으로 작성해주세요."},
  // 3페이지
  {id:"sec_privacy",label:"개인정보 수집 및 이용동의",type:"section_desc",page:3,desc:"수집 항목: 성명, 연락처, 생년월일, 주소, 학력\n수집 목적: 교육과정 신청 접수 및 안내\n보유 기간: 교육과정 종료 후 1년"},
  {id:"privacy_agree",label:"개인정보 수집 및 이용동의",type:"button_select",required:true,page:3,options:["동의합니다","동의하지 않습니다"]},
  {id:"ncs_card",label:"국민내일배움카드 보유 여부",type:"button_select",required:true,page:3,options:["보유","미보유","신청 예정"]},
  {id:"kdt_history",label:"과거 K-디지털트레이닝 과정 수강 여부",type:"button_select",required:true,page:3,options:["수강한 적 있음","수강한 적 없음"]},
  {id:"employment",label:"근로 여부",type:"button_select",required:true,page:3,options:["재직 중","구직 중","자영업","기타"]},
  {id:"subsidy",label:"신청일 기준 현재 받고 있는 지원금 여부",type:"button_select",required:true,page:3,options:["있음","없음"]},
  {id:"subsidy_detail",label:"현재 받고 있는 수당",type:"text",required:false,page:3,placeholder:"받고 있는 수당명을 적어주세요."},
  {id:"business",label:"신청일 기준 사업자등록 중 여부",type:"button_select",required:true,page:3,options:["등록 중","해당없음"]},
  {id:"weekday_available",label:"평일 9:00~18:00 교육 참여 가능 여부",type:"button_select",required:true,page:3,options:["가능","불가능","부분 가능"]},
  {id:"sec_motivation",label:"지원 동기",type:"section_desc",page:3,desc:"지원 동기와 수강 후 목표를 자유롭게 작성해주세요."},
  {id:"motivation",label:"지원 동기",type:"textarea",required:true,page:3,placeholder:"이 교육과정에 지원하게 된 이유와 수강 후 목표를 작성해주세요. (100자 이상)"},
  {id:"referrer",label:"추천인 (있을 경우)",type:"text",required:false,page:3,placeholder:"추천인 성함을 적어주세요."},
  {id:"sec_marketing",label:"마케팅 정보 수신 및 홍보 활용 동의",type:"section_desc",page:3,desc:"교육 관련 소식, 이벤트, 혜택 등 마케팅 정보 수신 및 홍보 활용에 동의합니다."},
  {id:"marketing_agree",label:"마케팅 정보 수신 및 홍보 활용 동의",type:"button_select",required:false,page:3,options:["동의합니다","동의하지 않습니다"]},
]
function optionValuesToOpts(options:any[] = []):Opt[]{
  return options.map((option:any)=>{
    const label=String(option?.label??option?.value??option)
    const value=String(option?.value??option?.label??option)
    const key=value.trim().toLowerCase()
    const isEtc=!!option?.isEtc||label.includes("기타")||label.includes("직접")||value.includes("기타")||value.includes("직접")||key==="etc"||key==="other"
    return {label,value,isEtc}
  })
}
function kdtFieldsToFormFields(fields:any[] = []):any[]{
  return fields.map((field:any)=>{
    const id=String(field.id||`field_${Date.now()}`)
    const rawType=String(field.type||"text")
    const type=rawType==="section_desc"
      ? "section_desc"
      : rawType==="text"&&id.toLowerCase().includes("phone")
        ? "phone"
        : rawType==="text"&&id.toLowerCase().includes("email")
          ? "email"
          : rawType
    const next:any={
      ...field,
      id,
      type,
      label:field.label||"새 질문",
      page:field.page||1,
      required:!!field.required,
      placeholder:rawType==="section_desc"?(field.desc||field.placeholder||""):field.placeholder,
    }
    if(Array.isArray(field.opts)&&field.opts.length)next.opts=optionValuesToOpts(field.opts)
    else if(Array.isArray(field.options)&&field.options.length)next.opts=optionValuesToOpts(field.options)
    delete next.options
    return next
  })
}
const KDT_FORM_PAGE_LABELS = ["기본 정보","상세 정보","자격 요건 및 동의"]
const KDT_FORM_FIELDS_DEFAULT = kdtFieldsToFormFields(KDT_FIELDS_DEFAULT)
const DEF_KDT: Cfg = {
  header:{imageUrl:"",programId:"",overline:"교육과정 신청",title:"폼 제목을 입력해주세요.",educationStart:"",educationEnd:"",tuitionFree:false,tuitionFreeText:"",tuitionAmount:"",stipend:"",noticeEnabled:true,noticeIconEnabled:false,noticeIconText:"i",noticeText:"아래 항목을 모두 성실하게 작성해주세요. 총 3단계로 구성되어 있습니다.",applicationType:"formal"},
  form:{
    showNum:true,
    dupText:"이미 신청 내역이 있어요.",
    pages:3,
    pageLabels:KDT_FORM_PAGE_LABELS,
    fields:KDT_FORM_FIELDS_DEFAULT,
  },
  consents:[
    {enabled:true,required:true,title:"개인정보 수집 및 이용동의",body:"수집 항목: 성명, 연락처, 생년월일, 주소, 학력, 이메일\n수집 목적: 교육과정 신청 접수 및 안내\n보유 기간: 교육과정 종료 후 1년",checkLabel:"개인정보 수집 및 이용에 동의합니다.",policyUrl:"https://sniperfactory.com/privacy"},
    {enabled:true,required:false,title:"마케팅 정보 수신 및 홍보 활용 동의",body:"교육 관련 최신 소식, 이벤트, 혜택 등 마케팅 정보를 수신하며 홍보 활용에 동의합니다.",checkLabel:"마케팅 정보 수신 및 홍보 활용에 동의합니다.",policyUrl:"https://sniperfactory.com/marketing"},
  ],
  cta:{label:"교육과정 신청하기",loadLabel:"신청 중...",height:52,bg:"#529DFF",color:"#FFFFFF"},
  modal:{title:"신청이 완료되었어요!",body:"담당자가 검토 후 연락드릴게요.",btnLabel:"교육과정 더 보러가기",btnUrl:"https://insideout.or.kr/program",btnReplace:false},
  styles:{theme:"light",fieldH:44,qGap:28,maxW:560,labelGap:12,seniorMode:false},
  auth:{enabled:true,loginUrl:"/login",errText:"로그인이 필요해요."},
  brand:"",
  formType:"blank" as const,
  kdtFields:undefined,
}
const DEF_BLANK: Cfg = {
  header:{imageUrl:"",programId:"",overline:"",title:"폼 제목을 입력해주세요.",educationStart:"",educationEnd:"",tuitionFree:true,tuitionFreeText:"",tuitionAmount:"",stipend:"",noticeEnabled:false,noticeIconEnabled:false,noticeIconText:"i",noticeText:""},
  form:{showNum:true,dupText:"",pages:1,fields:[]},
  consents:[{enabled:false,required:false,title:"",body:"",checkLabel:"",policyUrl:""}],
  cta:{label:"신청하기",loadLabel:"신청 중...",height:48,bg:"#3182F6",color:"#FFFFFF"},
  modal:{title:"신청이 완료되었어요!",body:"",btnLabel:"교육과정 더 보러가기",btnUrl:"https://insideout.or.kr/program",btnReplace:false},
  styles:{theme:"light",fieldH:44,qGap:28,maxW:560,labelGap:12,seniorMode:false},
  auth:{enabled:true,loginUrl:"/login",errText:"로그인이 필요해요."},
  brand:"",
  formType:"blank" as const,
  kdtFields:undefined,
}

const DEF_EDU_BIZ: Cfg = {
  header:{imageUrl:"",programId:"",overline:"교육 사업 신청",title:"폼 제목을 입력해주세요.",educationStart:"",educationEnd:"",tuitionFree:false,tuitionFreeText:"",tuitionAmount:"",stipend:"",noticeEnabled:false,noticeIconEnabled:false,noticeIconText:"i",noticeText:""},
  form:{showNum:true,dupText:"이미 신청하셨어요.",pages:1,fields:[
    {id:"company_name",type:"text" as const,label:"기업명",placeholder:"기업명을 입력해주세요.",required:true},
    {id:"contact_name",type:"text" as const,label:"담당자 성함",placeholder:"성함을 입력해주세요.",required:true},
    {id:"contact_phone",type:"text" as const,label:"담당자 연락처",placeholder:"예) 010-1234-5678",required:true},
    {id:"contact_email",type:"email" as const,label:"담당자 이메일",placeholder:"예) contact@company.com",required:true},
    {id:"business_type",type:"text" as const,label:"사업 유형",placeholder:"신청하시는 사업 유형을 입력해주세요.",required:true},
    {id:"inquiry",type:"textarea" as const,label:"문의 내용",placeholder:"문의하실 내용을 자유롭게 작성해주세요.",required:false},
  ]},
  consents:[{enabled:true,required:true,title:"개인정보 수집 및 이용동의",body:"수집 항목: 기업명, 담당자 성함·연락처·이메일\n수집 목적: 교육 사업 신청 접수 및 안내\n보유 기간: 사업 종료 후 1년",checkLabel:"개인정보 수집 및 이용에 동의합니다.",policyUrl:""}],
  cta:{label:"신청하기",loadLabel:"신청 중...",height:48,bg:"#529DFF",color:"#FFFFFF"},
  modal:{title:"신청이 완료되었어요!",body:"담당자가 검토 후 연락드릴게요.",btnLabel:"교육과정 더 보러가기",btnUrl:"https://insideout.or.kr/program",btnReplace:false},
  styles:{theme:"light",fieldH:44,qGap:28,maxW:560,labelGap:12,seniorMode:false},
  auth:{enabled:true,loginUrl:"/login",errText:"로그인이 필요해요."},
  brand:"",
  formType:"edu_biz" as const,
  kdtFields:undefined,
}
const DEF_COMPANY: Cfg = {
  header:{imageUrl:"",programId:"",overline:"참여기업 프로그램 신청",title:"폼 제목을 입력해주세요.",educationStart:"",educationEnd:"",tuitionFree:false,tuitionFreeText:"",tuitionAmount:"",stipend:"",noticeEnabled:false,noticeIconEnabled:false,noticeIconText:"i",noticeText:""},
  form:{showNum:true,dupText:"이미 신청하셨어요.",pages:1,fields:[
    {id:"company_name",type:"text" as const,label:"기업명",placeholder:"기업명을 입력해주세요.",required:true},
    {id:"industry",type:"text" as const,label:"업종",placeholder:"업종을 입력해주세요.",required:true},
    {id:"contact_name",type:"text" as const,label:"담당자 성함",placeholder:"성함을 입력해주세요.",required:true},
    {id:"contact_position",type:"text" as const,label:"직책",placeholder:"직책을 입력해주세요.",required:false},
    {id:"contact_phone",type:"text" as const,label:"담당자 연락처",placeholder:"예) 010-1234-5678",required:true},
    {id:"contact_email",type:"email" as const,label:"담당자 이메일",placeholder:"예) contact@company.com",required:true},
    {id:"program_type",type:"button_select" as const,label:"신청 프로그램",required:true,cols:1,opts:[
      {label:"인턴십 프로그램",value:"internship",isEtc:false},
      {label:"채용 연계 프로그램",value:"hiring",isEtc:false},
      {label:"기타",value:"etc",isEtc:true},
    ]},
    {id:"inquiry",type:"textarea" as const,label:"추가 문의",placeholder:"추가로 문의하실 내용이 있으면 작성해주세요.",required:false},
  ]},
  consents:[{enabled:true,required:true,title:"개인정보 수집 및 이용동의",body:"수집 항목: 기업명, 담당자 성함·연락처·이메일\n수집 목적: 참여기업 프로그램 신청 접수 및 안내\n보유 기간: 프로그램 종료 후 1년",checkLabel:"개인정보 수집 및 이용에 동의합니다.",policyUrl:""}],
  cta:{label:"신청하기",loadLabel:"신청 중...",height:48,bg:"#529DFF",color:"#FFFFFF"},
  modal:{title:"신청이 완료되었어요!",body:"담당자가 검토 후 연락드릴게요.",btnLabel:"교육과정 더 보러가기",btnUrl:"https://insideout.or.kr/program",btnReplace:false},
  styles:{theme:"light",fieldH:44,qGap:28,maxW:560,labelGap:12,seniorMode:false},
  auth:{enabled:true,loginUrl:"/login",errText:"로그인이 필요해요."},
  brand:"",
  formType:"company" as const,
  kdtFields:undefined,
}
const DEF_RECRUIT: Cfg = {
  header:{imageUrl:"",programId:"",overline:"채용 지원",title:"폼 제목을 입력해주세요.",educationStart:"",educationEnd:"",tuitionFree:false,tuitionFreeText:"",tuitionAmount:"",stipend:"",noticeEnabled:false,noticeIconEnabled:false,noticeIconText:"i",noticeText:""},
  form:{showNum:true,dupText:"이미 지원하셨어요.",pages:1,fields:[
    {id:"name",type:"text" as const,label:"성함",placeholder:"성함을 입력해주세요.",required:true},
    {id:"phone",type:"text" as const,label:"연락처",placeholder:"예) 010-1234-5678",required:true},
    {id:"email",type:"email" as const,label:"이메일",placeholder:"예) name@email.com",required:true},
    {id:"position",type:"text" as const,label:"지원 직무",placeholder:"지원하시는 직무를 입력해주세요.",required:true},
    {id:"career",type:"button_select" as const,label:"경력 여부",required:true,cols:2,opts:[
      {label:"신입",value:"fresh",isEtc:false},
      {label:"경력",value:"experienced",isEtc:false},
    ]},
    {id:"portfolio",type:"text" as const,label:"포트폴리오 URL",placeholder:"포트폴리오 링크를 입력해주세요. (선택)",required:false},
    {id:"introduce",type:"textarea" as const,label:"자기소개",placeholder:"간략한 자기소개를 작성해주세요.",required:true},
  ]},
  consents:[{enabled:true,required:true,title:"개인정보 수집 및 이용동의",body:"수집 항목: 성함, 연락처, 이메일\n수집 목적: 채용 전형 진행\n보유 기간: 채용 전형 종료 후 6개월",checkLabel:"개인정보 수집 및 이용에 동의합니다.",policyUrl:""}],
  cta:{label:"지원하기",loadLabel:"제출 중...",height:48,bg:"#529DFF",color:"#FFFFFF"},
  modal:{title:"지원이 완료되었어요!",body:"서류 검토 후 연락드릴게요.",btnLabel:"교육과정 더 보러가기",btnUrl:"https://insideout.or.kr/program",btnReplace:false},
  styles:{theme:"light",fieldH:44,qGap:28,maxW:560,labelGap:12,seniorMode:false},
  auth:{enabled:true,loginUrl:"/login",errText:"로그인이 필요해요."},
  brand:"",
  formType:"recruit" as const,
  kdtFields:undefined,
}
// ─── Helpers ──────────────────────────────────────────────────────────────
let _sb: SupabaseClient|null = null
function getSB(url?:string,key?:string):SupabaseClient|null {
  const u=(url||"").trim(),k=(key||"").trim()
  if(!u||!k)return null
  if(_sb&&(_sb as any).__sig===`${u}::${k}`)return _sb
  _sb=createClient(u,k);(_sb as any).__sig=`${u}::${k}`;return _sb
}
function dc<T>(v:T):T{return JSON.parse(JSON.stringify(v))}
function fmtNum(v:string){return v.replace(/\D/g,"").replace(/\B(?=(\d{3})+(?!\d))/g,",")}
function fmtDateKo(d:string){if(!d)return "";const dt=new Date(d+"T00:00:00");const days=["일","월","화","수","목","금","토"];const y=String(dt.getFullYear()).slice(2);const m=String(dt.getMonth()+1).padStart(2,"0");const day=String(dt.getDate()).padStart(2,"0");return `${y}.${m}.${day}(${days[dt.getDay()]})`}
function durationText(days:number){
  if(days<30)return `총 ${days}일`
  const months=Math.floor(days/30),remD=days%30,weeks=Math.floor(remD/7),remDays=remD%7
  let text=`총 ${months}개월`
  if(weeks>0)text+=` ${weeks}주`
  if(remDays>0)text+=` ${remDays}일`
  return text
}
function dateOnlyMs(value:string){
  const raw=String(value||"").trim().slice(0,10)
  if(!raw)return 0
  const time=new Date(raw+"T00:00:00").getTime()
  return Number.isFinite(time)?time:0
}
function makeEducationSchedule(type:EducationScheduleType="range",patch:Partial<EducationSchedule>={}):EducationSchedule{
  const id=patch.id||`edu_${Date.now()}_${Math.random().toString(36).slice(2,7)}`
  return type==="single"?{id,type,date:"",...patch}:{id,type,start:"",end:"",...patch}
}
function normalizeEducationSchedule(raw:any,index=0):EducationSchedule|null{
  if(!raw||typeof raw!=="object")return null
  const type:EducationScheduleType=raw.type==="single"?"single":"range"
  const base={id:String(raw.id||`edu_${index+1}`),type,label:String(raw.label||"").trim()}
  if(type==="single")return{...base,date:String(raw.date||raw.start||"").trim().slice(0,10)}
  return{...base,start:String(raw.start||"").trim().slice(0,10),end:String(raw.end||"").trim().slice(0,10)}
}
function educationSchedulesFromHeader(header?:Cfg["header"]|null):EducationSchedule[]{
  const raw=Array.isArray(header?.educationSchedules)?header!.educationSchedules:[]
  const normalized=raw.map((item,index)=>normalizeEducationSchedule(item,index)).filter(Boolean) as EducationSchedule[]
  if(normalized.length)return normalized
  const start=String(header?.educationStart||"").trim().slice(0,10)
  const end=String(header?.educationEnd||"").trim().slice(0,10)
  return start||end?[makeEducationSchedule("range",{id:"legacy_education_period",label:"교육기간",start,end})]:[]
}
function educationScheduleRange(schedule:EducationSchedule){
  if(schedule.type==="single"){
    const date=String(schedule.date||schedule.start||"").trim().slice(0,10)
    const time=dateOnlyMs(date)
    return time?{start:date,end:date,startAt:time,endAt:time}:null
  }
  const start=String(schedule.start||"").trim().slice(0,10)
  const end=String(schedule.end||"").trim().slice(0,10)
  const startAt=dateOnlyMs(start)
  const endAt=dateOnlyMs(end)
  if(!startAt&&!endAt)return null
  return{start,end,startAt,endAt}
}
function primaryEducationRange(schedules:EducationSchedule[]){
  const ranges=schedules.map(educationScheduleRange).filter(Boolean) as {start:string;end:string;startAt:number;endAt:number}[]
  if(!ranges.length)return{start:"",end:""}
  const sorted=[...ranges].sort((a,b)=>(a.startAt||0)-(b.startAt||0))
  return{start:sorted[0].start||"",end:sorted[0].end||""}
}
function headerWithEducationSchedules(header:Cfg["header"],schedules?:EducationSchedule[]):Cfg["header"]{
  const educationSchedules=schedules?schedules.map((item,index)=>normalizeEducationSchedule(item,index)).filter(Boolean) as EducationSchedule[]:educationSchedulesFromHeader(header)
  const primary=primaryEducationRange(educationSchedules)
  return{...header,educationSchedules,educationStart:primary.start,educationEnd:primary.end}
}
function educationScheduleText(schedule:EducationSchedule){
  const range=educationScheduleRange(schedule)
  if(!range)return""
  if(schedule.type==="single"||range.start===range.end)return`${fmtDateKo(range.start)} · 1일`
  const days=Math.round((range.endAt-range.startAt)/(1000*60*60*24))+1
  if(days<1)return`${fmtDateKo(range.start)} ~ ${fmtDateKo(range.end)} · 날짜 확인 필요`
  return`${fmtDateKo(range.start)} ~ ${fmtDateKo(range.end)} · ${durationText(days)}`
}
function educationScheduleSummaries(header?:Cfg["header"]|null){
  return educationSchedulesFromHeader(header).map(schedule=>({
    label:String(schedule.label||"").trim(),
    text:educationScheduleText(schedule),
  })).filter(item=>item.text)
}
function EducationSchedulesEditor({schedules,onChange,A}:{schedules:EducationSchedule[];onChange:(next:EducationSchedule[])=>void;A:AT}){
  const update=(id:string,patch:Partial<EducationSchedule>)=>onChange(schedules.map(schedule=>schedule.id===id?{...schedule,...patch}:schedule))
  const remove=(id:string)=>onChange(schedules.filter(schedule=>schedule.id!==id))
  const add=(type:EducationScheduleType)=>onChange([...schedules,makeEducationSchedule(type)])
  const inputStyle={minWidth:0,width:"100%",height:38,padding:"0 11px",borderRadius:9,border:"none",background:A.card,color:A.t1,fontFamily:FONT,fontSize:12.5,boxSizing:"border-box" as const}
  return <div style={{display:"flex",flexDirection:"column" as const,gap:9}}>
    {schedules.length===0&&<div style={{padding:"12px",borderRadius:11,border:"none",background:panelFieldBg(A),color:A.t3,fontSize:12.5,lineHeight:1.5}}>아직 추가된 교육 일정이 없어요.</div>}
    {schedules.map((schedule,index)=>{
      const summary=educationScheduleText(schedule)
      const setType=(type:EducationScheduleType)=>update(schedule.id,{type,date:type==="single"?(schedule.date||schedule.start||""):"",start:type==="range"?(schedule.start||schedule.date||""):"",end:type==="range"?(schedule.end||schedule.date||""):""})
      return <div key={schedule.id} style={{padding:10,borderRadius:11,border:"none",background:panelFieldBg(A),display:"flex",flexDirection:"column" as const,gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <PanelSegment inline value={schedule.type==="single"?"single":"range"} onChange={v=>setType(v as EducationScheduleType)} A={A}
            height={28} fontSize={12.5} trackBg={A===ALT?"#E7EAEF":A.bg}
            options={[{value:"range",label:"기간"},{value:"single",label:"단일 날짜"}]}/>
          <div style={{flex:1}}/>
          <button onClick={()=>remove(schedule.id)} title="일정 삭제" aria-label="일정 삭제"
            style={{width:30,height:30,borderRadius:8,border:"none",background:"transparent",color:A.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card;(e.currentTarget as HTMLElement).style.color=A.red}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color=A.t3}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M9.5 4.5h5a1 1 0 0 1 1 1V7h-7V5.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M6 7.5h12l-.85 11.1a1.5 1.5 0 0 1-1.5 1.4H8.35a1.5 1.5 0 0 1-1.5-1.4L6 7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <input value={schedule.label||""} onChange={e=>update(schedule.id,{label:e.target.value})} placeholder={`일정 이름 (예: ${index+1}회차)`} style={inputStyle}/>
        {schedule.type==="single"
          ? <input type="date" value={schedule.date||""} onChange={e=>update(schedule.id,{date:e.target.value})} style={inputStyle}/>
          : <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",gap:8}}>
              <input type="date" value={schedule.start||""} onChange={e=>update(schedule.id,{start:e.target.value})} style={inputStyle}/>
              <span style={{color:A.t3,fontSize:12,flexShrink:0}}>~</span>
              <input type="date" value={schedule.end||""} onChange={e=>update(schedule.id,{end:e.target.value})} style={inputStyle}/>
            </div>}
        {summary&&<div style={{fontSize:11.5,color:A.t3,lineHeight:1.45,padding:"0 2px"}}>{summary}</div>}
      </div>
    })}
    <button onClick={()=>add("range")}
      style={{width:"100%",height:38,borderRadius:9,border:`1.5px solid ${A.blue}`,background:A.card,color:A.blue,fontFamily:FONT,fontSize:12.5,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      일정 추가
    </button>
  </div>
}
function mergeCfg(raw:any):Cfg {
  const d=dc(DEF)
  if(!raw)return d
  const rawIntegrations=raw.integrations||{}
  const isLegacyKdt=raw.formType==="kdt"
  const legacyKdtFields=isLegacyKdt&&Array.isArray(raw.kdtFields)&&raw.kdtFields.length?kdtFieldsToFormFields(raw.kdtFields):null
  const legacyKdtPages=legacyKdtFields?Math.max(3,...legacyKdtFields.map((f:any)=>f.page||1)):0
  return {
    header:headerWithEducationSchedules({...d.header,...(raw.header||{}),...(isLegacyKdt&&!(raw.header||{}).applicationType?{applicationType:"formal"}:{})}),
    ad:{...DEFAULT_FORM_AD,...(raw.ad||{})},
    form:(()=>{
      const rf=raw.form||{}
      const df=d.form
      const pages=rf.pages||df.pages||1
      if(legacyKdtFields){
        return {showNum:rf.showNum!==false,dupText:rf.dupText||"이미 신청 내역이 있어요.",pages:legacyKdtPages,pageLabels:rf.pageLabels||KDT_FORM_PAGE_LABELS,consentPosition:rf.consentPosition==="start"?"start":"end",fields:legacyKdtFields.map((f:any)=>({...f,page:f.page||1}))}
      }
      // backward compat: old q1/q2/q3/q4 → fields array
      if(!rf.fields&&(rf.q1Label||rf.q2Label)){
        return {showNum:rf.showNum!==false,dupText:rf.dupText||df.dupText,pages:pages,consentPosition:rf.consentPosition==="start"?"start":"end",fields:[
          {id:"name",type:"text",label:rf.q1Label||"이름을 입력해주세요.",placeholder:rf.q1Ph||"예) 홍길동",required:true},
          {id:"phone",type:"phone",label:rf.q2Label||"연락 가능한 휴대폰 번호를 입력해 주세요.",placeholder:rf.q2Ph||"예) 010-1234-5678",helper:rf.q2Helper||"",required:true,dupCheck:true},
          {id:"email",type:"email",label:rf.q3Label||"이메일 주소를 입력해주세요.",placeholder:rf.q3Ph||"예) example@insideout.or.kr",helper:rf.q3Helper||"",required:true},
          {id:"referral",type:"dropdown",label:rf.q4Label||"어디서 알게 되셨나요?",placeholder:rf.q4Ph||"선택해주세요.",required:false,opts:rf.opts||DEFOPTS,etcPh:rf.etcPh||"기타 경로를 입력해주세요."},
        ]}
      }
      return {showNum:rf.showNum!==false,dupText:rf.dupText||df.dupText,pages:rf.pages||df.pages||1,pageLabels:rf.pageLabels||df.pageLabels,consentPosition:rf.consentPosition==="start"?"start":"end",fields:(rf.fields||df.fields).map((f:any)=>({...f,page:f.page||1}))}
    })(),
    consents:Array.isArray(raw.consents)&&raw.consents.length>0?raw.consents.map((c:any)=>({...d.consents[0],...c})):(raw.consent?[{...d.consents[0],...raw.consent}]:dc(d.consents)),
    cta:{...d.cta,...(raw.cta||{})},
    modal:{...d.modal,...(raw.modal||{}),shareButtons:{...DEFAULT_MODAL_SHARE_BUTTONS,...(d.modal.shareButtons||{}),...(raw.modal?.shareButtons||{})}},
    styles:{...d.styles,...(raw.styles||{})},
    auth:{...d.auth,...(raw.auth||{})},
    integrations:{
      ...rawIntegrations,
      googleSheets:{...DEFAULT_GOOGLE_SHEETS,...(rawIntegrations.googleSheets||{})},
      qrLinks:Array.isArray(rawIntegrations.qrLinks)?rawIntegrations.qrLinks.filter((item:any)=>item&&item.code&&item.url):[],
    },
    dashboard:dashboardWithOperationPeriods({...(isLegacyKdt?{formTypeTag:"application" as DashboardFormType}:{}),...(raw.dashboard||{})}),
    brand:raw.brand||d.brand,
    formType:isLegacyKdt?"blank" as const:(raw.formType||d.formType),
    kdtFields:isLegacyKdt?undefined:(raw.kdtFields||d.kdtFields),
  }
}
function applyBrandDefaults(config:Cfg,brand:string):Cfg{
  const next=dc(config)
  const normalizedBrand=canonicalBrand(brand||next.brand||"")
  next.brand=normalizedBrand||next.brand
  next.form={...next.form,consentPosition:next.form.consentPosition==="start"?"start":"end"}
  next.consents=(next.consents||[]).map(cs=>{
    const consentType=cs.consentType||consentTypeFromTitle(cs.title)
    const policyMode=cs.policyMode==="custom"?"custom":"brand"
    const policyUrl=policyMode==="brand"&&consentType?policyUrlForConsent(consentType,normalizedBrand):cs.policyUrl
    return {...cs,policyMode,...(consentType?{consentType}:{}),...(policyUrl?{policyUrl}:{}),...(!cs.title&&consentType?{title:consentLabelForType(consentType)}:{})}
  })
  if(normalizedBrand==="SNIPERFACTORY"&&(!next.modal.btnUrl||next.modal.btnUrl==="https://insideout.or.kr/program")){
    next.modal.btnUrl="https://sniperfactory.com/program"
  }
  return next
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────
// 시안 우측 패널은 테두리 없는 채움형 컨트롤을 쓴다. 라이트는 #F6F7F9, 다크는 card2.
const panelFieldBg=(A:AT)=>A===ALT?"#F6F7F9":A.card2
const panelFieldRing=(A:AT)=>`inset 0 0 0 1.5px ${A.blue}`
function PanelSegment({value,options,onChange,A,height=38,fontSize=12.5,trackBg,inline=false}:{
  value:string
  options:{value:string;label:React.ReactNode;icon?:React.ReactNode}[]
  onChange:(v:string)=>void
  A:AT
  height?:number
  fontSize?:number
  trackBg?:string
  inline?:boolean
}){
  const count=options.length
  const activeIdx=options.findIndex(opt=>opt.value===value)
  return <div style={{position:"relative" as const,display:inline?"inline-grid":"grid",gridAutoFlow:"column" as const,gridAutoColumns:"1fr",alignItems:"center",padding:3,borderRadius:9,flexShrink:0,background:trackBg||(A===ALT?"#F1F3F6":A.bg)}}>
    {/* 선택 표시(흰 알약) — 버튼마다 배경을 켜는 대신 하나를 좌우로 이동시킨다 */}
    {activeIdx>=0&&<span aria-hidden="true" style={{
      position:"absolute" as const,top:3,bottom:3,left:3,
      width:`calc((100% - 6px) / ${count})`,
      transform:`translateX(${activeIdx*100}%)`,
      borderRadius:7,background:A.card,boxShadow:"0 1px 2px rgba(16,24,40,.10)",
      transition:"transform .22s cubic-bezier(.4,0,.2,1)",pointerEvents:"none" as const,
    }}/>}
    {options.map(opt=>{
      const on=opt.value===value
      return <button key={opt.value} type="button" onClick={()=>onChange(opt.value)}
        style={{position:"relative" as const,zIndex:1,minWidth:0,height,borderRadius:7,border:"none",background:"transparent",
          cursor:"pointer",fontFamily:FONT,fontSize,fontWeight:600,color:on?A.blue:A.t2,
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"0 10px",
          transition:"color .18s ease",whiteSpace:"nowrap" as const,overflow:"hidden"}}>
        {opt.icon}
        <span style={{minWidth:0,overflow:"hidden",textOverflow:"ellipsis"}}>{opt.label}</span>
      </button>
    })}
  </div>
}
function PanelSelect({value,options,onChange,placeholder="선택해주세요",A,height=40,fontSize=13,fontWeight=500,radius=10,width,maxWidth,padX=14}:{value:string;options:{value:string;label:string}[];onChange:(v:string)=>void;placeholder?:string;A:AT;height?:number;fontSize?:number;fontWeight?:number;radius?:number;width?:number|string;maxWidth?:number;padX?:number}){
  const [open,setOpen]=React.useState(false)
  const current=options.find(o=>o.value===value)
  return <div style={{position:"relative" as const,width:width??"100%",maxWidth,flexShrink:0}}>
    <button type="button" onClick={()=>setOpen(v=>!v)}
      style={{width:"100%",height,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:`0 ${padX}px`,borderRadius:radius,border:"none",
        background:panelFieldBg(A),color:current?A.t1:A.t3,fontFamily:FONT,fontSize,fontWeight,cursor:"pointer",textAlign:"left" as const,
        boxShadow:open?`inset 0 0 0 1.5px ${A.blue}`:"none",transition:"box-shadow .12s"}}>
      <span style={{minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{current?current.label:placeholder}</span>
      <svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{flexShrink:0,color:A.t3,transform:open?"rotate(180deg)":"none",transition:"transform .15s"}}>
        <path d="M2 3.5 5 6.5l3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
    {open&&<>
      <div onClick={()=>setOpen(false)} style={{position:"fixed" as const,inset:0,zIndex:59}}/>
      <div style={{position:"absolute" as const,top:height+6,left:0,minWidth:"100%",zIndex:60,maxHeight:260,overflowY:"auto" as const,padding:6,borderRadius:12,
        background:A.card,border:A===ALT?"none":`1px solid ${A.border}`,boxShadow:"0 1px 2px rgba(16,24,40,.08), 0 16px 40px -10px rgba(16,24,40,.28)"}}>
        {options.map(opt=>{
          const sel=opt.value===value
          return <button key={opt.value||"__empty"} type="button" onClick={()=>{onChange(opt.value);setOpen(false)}}
            style={{width:"100%",minHeight:40,display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:9,border:"none",
              background:sel?panelFieldBg(A):"transparent",color:sel?A.t1:A.t2,fontFamily:FONT,fontSize:13,fontWeight:sel?700:500,whiteSpace:"nowrap" as const,cursor:"pointer",textAlign:"left" as const,lineHeight:1.4}}
            onMouseEnter={e=>{if(!sel)(e.currentTarget as HTMLElement).style.background=panelFieldBg(A)}}
            onMouseLeave={e=>{if(!sel)(e.currentTarget as HTMLElement).style.background="transparent"}}>
            <span style={{flex:1,minWidth:0}}>{opt.label}</span>
            {sel&&<svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{flexShrink:0,color:A.blue}}><path d="M1.5 5.2 3.8 7.5 8.5 2.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </button>
        })}
      </div>
    </>}
  </div>
}
function PanelCheckRow({label,on,toggle,A}:{label:string;on:boolean;toggle:()=>void;A:AT}){
  return <label onClick={toggle} style={{display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12.5,fontWeight:600,color:A.t1,fontFamily:FONT,userSelect:"none" as const}}>
    <span style={{width:16,height:16,borderRadius:4,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
      background:on?A.blue:panelFieldBg(A),boxShadow:on?"none":`inset 0 0 0 1.5px ${A.border2}`,transition:"background .12s"}}>
      {on&&<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5.2 3.8 7.5 8.5 2.8" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </span>
    {label}
  </label>
}
function TRow({label,on,toggle,A}:{label:string;on:boolean;toggle:()=>void;A:AT}) {
  return <div onClick={toggle} style={{height:48,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px",borderRadius:10,background:panelFieldBg(A),border:"none",cursor:"pointer",marginBottom:10,boxSizing:"border-box" as const}}>
    <span style={{fontSize:13.5,fontWeight:600,color:A.t1,fontFamily:FONT}}>{label}</span>
    <div style={{width:44,height:25,borderRadius:13,background:on?A.blue:(A===ALT?"#DFE3E9":A.border2),position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{position:"absolute",width:19,height:19,borderRadius:"50%",background:"#fff",top:3,left:on?22:3,transition:"left .2s",boxShadow:"0 1px 3px rgba(16,24,40,0.24)"}}/>
    </div>
  </div>
}
function TIn({value,onChange,placeholder,type="text",A}:{value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;A:AT}) {
  const [f,sf]=React.useState(false)
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    onFocus={()=>sf(true)} onBlur={()=>sf(false)}
    style={{width:"100%",height:40,background:panelFieldBg(A),border:"none",borderRadius:9,color:A.t1,fontFamily:FONT,fontSize:12.5,padding:"0 12px",outline:"none",boxSizing:"border-box" as const,boxShadow:f?panelFieldRing(A):"none",transition:"box-shadow .15s"}}/>
}
function TArea({value,onChange,placeholder,minH=88,A}:{value:string;onChange:(v:string)=>void;placeholder?:string;minH?:number;A:AT}) {
  const [f,sf]=React.useState(false)
  return <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    onFocus={()=>sf(true)} onBlur={()=>sf(false)}
    style={{width:"100%",minHeight:minH,background:panelFieldBg(A),border:"none",borderRadius:10,color:A.t1,fontFamily:FONT,fontSize:13,padding:"11px 12px",outline:"none",resize:"vertical" as const,lineHeight:1.6,boxSizing:"border-box" as const,boxShadow:f?panelFieldRing(A):"none",transition:"box-shadow .15s"}}/>
}
function Slider({value,min,max,step=1,unit="px",onChange,A}:{value:number;min:number;max:number;step?:number;unit?:string;onChange:(v:number)=>void;A:AT}) {
  return <div style={{display:"flex",alignItems:"center",gap:10}}>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}
      style={{flex:1,WebkitAppearance:"none" as any,height:4,borderRadius:2,background:A.border2,outline:"none",border:"none",padding:0,cursor:"pointer"}}/>
    <span style={{fontSize:14,fontWeight:700,color:A.t3,minWidth:56,textAlign:"right" as const,fontFamily:FONT}}>{value}{unit}</span>
  </div>
}
// ─── Color picker ─────────────────────────────────────────────────────────
const HEX_RE=/^#[0-9a-fA-F]{6}$/
function hexToRgb(hex:string){
  const v=HEX_RE.test(hex)?hex:"#000000"
  return {r:parseInt(v.slice(1,3),16),g:parseInt(v.slice(3,5),16),b:parseInt(v.slice(5,7),16)}
}
function rgbToHex(r:number,g:number,b:number){
  const to=(n:number)=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,"0")
  return `#${to(r)}${to(g)}${to(b)}`
}
function rgbToHsv(r:number,g:number,b:number){
  const R=r/255,G=g/255,B=b/255
  const max=Math.max(R,G,B),min=Math.min(R,G,B),d=max-min
  let h=0
  if(d!==0){
    if(max===R)h=((G-B)/d)%6
    else if(max===G)h=(B-R)/d+2
    else h=(R-G)/d+4
    h*=60
    if(h<0)h+=360
  }
  return {h,s:max===0?0:d/max,v:max}
}
function hsvToHex(h:number,s:number,v:number){
  const c=v*s,x=c*(1-Math.abs(((h/60)%2)-1)),m=v-c
  let r=0,g=0,b=0
  if(h<60){r=c;g=x} else if(h<120){r=x;g=c} else if(h<180){g=c;b=x}
  else if(h<240){g=x;b=c} else if(h<300){r=x;b=c} else {r=c;b=x}
  return rgbToHex((r+m)*255,(g+m)*255,(b+m)*255)
}
const COLOR_PRESETS=["#3182F6","#529DFF","#EA594D","#0F8A47","#6D4AEA","#F1C153","#15181D","#FFFFFF"]

function CIn({value,onChange,A}:{value:string;onChange:(v:string)=>void;A:AT}) {
  const [hex,sh]=React.useState(value)
  const [open,setOpen]=React.useState(false)
  const svRef=React.useRef<HTMLDivElement|null>(null)
  const hueRef=React.useRef<HTMLDivElement|null>(null)
  React.useEffect(()=>sh(value),[value])

  const safe=HEX_RE.test(value)?value:"#000000"
  const rgb=hexToRgb(safe)
  const hsv=rgbToHsv(rgb.r,rgb.g,rgb.b)

  // 포인터를 누른 채 움직이는 동안 계속 값을 갱신한다.
  const drag=(ref:React.MutableRefObject<HTMLDivElement|null>,handler:(x:number,y:number,rect:DOMRect)=>void)=>(e:React.PointerEvent)=>{
    const el=ref.current
    if(!el)return
    e.preventDefault()
    const apply=(cx:number,cy:number)=>handler(cx,cy,el.getBoundingClientRect())
    apply(e.clientX,e.clientY)
    const onMove=(ev:PointerEvent)=>apply(ev.clientX,ev.clientY)
    const onUp=()=>{window.removeEventListener("pointermove",onMove);window.removeEventListener("pointerup",onUp)}
    window.addEventListener("pointermove",onMove)
    window.addEventListener("pointerup",onUp)
  }
  const clamp01=(n:number)=>Math.max(0,Math.min(1,n))
  const onSv=drag(svRef,(x,y,r)=>{
    const next=hsvToHex(hsv.h,clamp01((x-r.left)/r.width),1-clamp01((y-r.top)/r.height))
    sh(next);onChange(next)
  })
  const onHue=drag(hueRef,(x,_y,r)=>{
    const next=hsvToHex(clamp01((x-r.left)/r.width)*360,hsv.s||1,hsv.v||1)
    sh(next);onChange(next)
  })

  return <div style={{position:"relative" as const,display:"flex",alignItems:"center",gap:8,width:"100%",minWidth:0}}>
    <button type="button" onClick={()=>setOpen(v=>!v)} aria-label="색상 선택"
      style={{width:34,height:34,flexShrink:0,border:"none",borderRadius:9,padding:3,background:panelFieldBg(A),cursor:"pointer",boxSizing:"border-box" as const,
        boxShadow:open?`inset 0 0 0 1.5px ${A.blue}`:"none"}}>
      <span style={{display:"block",width:"100%",height:"100%",borderRadius:6,background:safe,boxShadow:"inset 0 0 0 1px rgba(16,24,40,.12)"}}/>
    </button>
    <input type="text" value={hex} onChange={e=>{sh(e.target.value);if(HEX_RE.test(e.target.value))onChange(e.target.value)}}
      style={{flex:1,minWidth:0,height:34,background:panelFieldBg(A),border:"none",borderRadius:9,color:A.t1,fontFamily:FONT,fontSize:12.5,padding:"0 10px",outline:"none",boxSizing:"border-box" as const}}/>
    {open&&<>
      <div onClick={()=>setOpen(false)} style={{position:"fixed" as const,inset:0,zIndex:79}}/>
      <div style={{position:"absolute" as const,top:42,left:0,zIndex:80,width:236,padding:12,borderRadius:12,background:A.card,
        border:A===ALT?"none":`1px solid ${A.border}`,boxShadow:"0 1px 2px rgba(16,24,40,.08), 0 16px 40px -10px rgba(16,24,40,.28)"}}>
        {/* 명도·채도 */}
        <div ref={svRef} onPointerDown={onSv}
          style={{position:"relative" as const,width:"100%",height:132,borderRadius:9,cursor:"crosshair",touchAction:"none" as const,
            background:`linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hsvToHex(hsv.h,1,1)})`}}>
          <span style={{position:"absolute" as const,left:`${hsv.s*100}%`,top:`${(1-hsv.v)*100}%`,width:14,height:14,marginLeft:-7,marginTop:-7,
            borderRadius:"50%",border:"2px solid #fff",boxShadow:"0 0 0 1px rgba(16,24,40,.3)",pointerEvents:"none" as const}}/>
        </div>
        {/* 색상 */}
        <div ref={hueRef} onPointerDown={onHue}
          style={{position:"relative" as const,width:"100%",height:12,marginTop:12,borderRadius:999,cursor:"pointer",touchAction:"none" as const,
            background:"linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)"}}>
          <span style={{position:"absolute" as const,left:`${(hsv.h/360)*100}%`,top:"50%",width:16,height:16,marginLeft:-8,marginTop:-8,
            borderRadius:"50%",background:hsvToHex(hsv.h,1,1),border:"2px solid #fff",boxShadow:"0 1px 3px rgba(16,24,40,.35)",pointerEvents:"none" as const}}/>
        </div>
        {/* 프리셋 */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:5,marginTop:12}}>
          {COLOR_PRESETS.map(c=>(
            <button key={c} type="button" onClick={()=>{sh(c);onChange(c)}} title={c}
              style={{width:"100%",aspectRatio:"1",borderRadius:6,background:c,border:"none",cursor:"pointer",padding:0,
                boxShadow:safe.toLowerCase()===c.toLowerCase()?`inset 0 0 0 1.5px #fff, 0 0 0 2px ${A.blue}`:"inset 0 0 0 1px rgba(16,24,40,.12)"}}/>
          ))}
        </div>
      </div>
    </>}
  </div>
}
function FG({children,title,A,last=false}:{children:React.ReactNode;title?:string;A:AT;last?:boolean}) {
  return <div style={{marginBottom:last?0:20}}>
    {title&&<div style={{fontSize:11,fontWeight:700,color:A.t3,letterSpacing:".4px",marginBottom:8,fontFamily:FONT}}>{title}</div>}
    {children}
  </div>
}
function F({children,label,hint,A}:{children:React.ReactNode;label?:string;hint?:string;A:AT}) {
  return <div style={{marginBottom:12}}>
    {label&&<div style={{fontSize:12.5,fontWeight:600,color:A.t1,marginBottom:hint?4:8,fontFamily:FONT}}>{label}</div>}
    {hint&&<div style={{fontSize:11.5,color:A.t3,marginBottom:7,lineHeight:1.5,fontFamily:FONT}}>{hint}</div>}
    {children}
  </div>
}
function Btn({children,onClick,variant="ghost",disabled=false,sm=false,A}:{children:React.ReactNode;onClick?:()=>void;variant?:"primary"|"blue"|"ghost"|"danger"|"success";disabled?:boolean;sm?:boolean;A:AT}) {
  const [h,sh]=React.useState(false)
  const map:{[k:string]:{bg:string;col:string;bd:string}} = {
    primary: {bg:h?"#d14f4f":A.red, col:"#fff", bd:"transparent"},
    blue:    {bg:h?A.blue+"dd":A.blue, col:"#fff", bd:"transparent"},
    ghost:   {bg:h?A.card2:"transparent", col:h?A.t1:A.t2, bd:A.border},
    danger:  {bg:h?"rgba(232,92,92,0.12)":"rgba(232,92,92,0.06)", col:A.red, bd:"rgba(232,92,92,0.2)"},
    success: {bg:h?"rgba(23,201,100,0.15)":"rgba(23,201,100,0.08)", col:A.green, bd:"rgba(23,201,100,0.25)"},
  }
  const s=map[variant]
  return <button onClick={onClick} disabled={disabled} onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)}
    style={{height:sm?28:32,padding:sm?"0 12px":"0 14px",borderRadius:A.r,border:`1px solid ${s.bd}`,background:s.bg,color:s.col,fontFamily:FONT,fontSize:sm?12:12.5,fontWeight:variant==="blue"||variant==="primary"||variant==="success"?700:600,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:5,opacity:disabled?0.45:1,whiteSpace:"nowrap" as const,transition:"all .12s"}}>
    {children}
  </button>
}



// ─── Field type icons ─────────────────────────────────────────────────────
const FTYPE_ICONS:Record<string,React.ReactNode> = {
  text: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  phone: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1.5 3.5-1.8 1.1a9 9 0 0 0 3.7 3.7l1.1-1.8L15 10v3a1 1 0 0 1-1 1C5.6 14 2 8.4 2 3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  email: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 5l6 4.5L14 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  date: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  dropdown: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M6 8l2 2 2-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  button_select: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="5" height="6" rx="3" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="5" width="5" height="6" rx="3" stroke="currentColor" strokeWidth="1.4"/><circle cx="4.5" cy="8" r="1.5" fill="currentColor"/></svg>,
  textarea: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  checkbox: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><path d="M4 4.5l1 1 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" opacity="0.4"/><rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" opacity="0.4"/></svg>,
  info: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M8 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="5" r="0.8" fill="currentColor"/></svg>,
  file: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M9 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L9 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 9v3M6.5 10.5L8 9l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  time: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  name: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2.5 13.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  referral: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="8" r="2" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M7 7l3.5-2.5M7 9l3.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  ad: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 9.5 6.2 6.5 8 9.5M5.2 8.4h2.2M9.5 6.5h1.1c.9 0 1.5.6 1.5 1.5s-.6 1.5-1.5 1.5H9.5v-3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}
const FTYPES_DATA:{type:string;label:string;divider?:boolean}[] = [
  {type:"text",label:"단답형"},
  {type:"textarea",label:"장문형"},
  {type:"---a",label:"",divider:true},
  {type:"name",label:"이름"},
  {type:"phone",label:"전화번호"},
  {type:"email",label:"이메일"},
  {type:"referral",label:"유입경로"},
  {type:"---",label:"",divider:true},
  {type:"button_select",label:"단일 선택"},
  {type:"checkbox",label:"복수 선택"},
  {type:"dropdown",label:"드롭다운"},
  {type:"---2",label:"",divider:true},
  {type:"file",label:"첨부파일"},
  {type:"---3",label:"",divider:true},
  {type:"date",label:"날짜"},
  {type:"time",label:"시간"},
  {type:"---4",label:"",divider:true},
  {type:"info",label:"안내 텍스트"},
]

// ─── FieldOptAdder component ────────────────────────────────────────────────
function FieldOptAdder({fieldIdx,onAdd,A}:{fieldIdx:number;onAdd:(lbl:string,val:string)=>void;A:AT}){
  const [lbl,setLbl]=React.useState("")
  const FONT2="'Pretendard Variable','Pretendard',sans-serif"
  const add=()=>{
    const trimmed=lbl.trim()
    if(!trimmed)return
    onAdd(trimmed,trimmed)
    setLbl("")
  }
  return <div>
    <div style={{display:"flex",gap:6,alignItems:"stretch"}}>
      <textarea value={lbl} onChange={e=>setLbl(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!(e.nativeEvent as any).isComposing){e.preventDefault();add()}}}
        placeholder="답변 텍스트 입력"
        rows={1}
        style={{flex:1,minWidth:0,minHeight:40,background:panelFieldBg(A),border:"none",borderRadius:9,color:A.t1,fontFamily:FONT2,fontSize:12.5,padding:"11px 12px",outline:"none",resize:"vertical" as const,boxSizing:"border-box" as const,lineHeight:1.5}}/>
      <button onClick={add} disabled={!lbl.trim()}
        style={{width:56,flexShrink:0,borderRadius:9,border:"none",background:lbl.trim()?A.blue:panelFieldBg(A),color:lbl.trim()?"#fff":A.t3,cursor:lbl.trim()?"pointer":"not-allowed",fontFamily:FONT2,fontSize:12.5,fontWeight:600,transition:"background .12s, color .12s"}}>추가</button>
    </div>
    <div style={{marginTop:6,fontSize:11.5,color:A.t3,lineHeight:1.5}}>Enter로 추가, Shift+Enter로 줄바꿈</div>
  </div>
}

// ─── Markdown helpers ─────────────────────────────────────────────────────
function mdToHtml(text:string):string{
  const source=String(text||"").replace(/&quot;|&#34;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&#42;|&ast;/gi,"*")
  const esc=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  const attr=(s:string)=>esc(s).replace(/"/g,"&quot;").replace(/'/g,"&#39;")
  const safeHref=(raw:string)=>{
    const href=String(raw||"").trim()
    if(!href||/[\s"'<>]/.test(href))return"#"
    try{
      const url=new URL(href,"https://catchform.local")
      if(["http:","https:","mailto:","tel:"].includes(url.protocol))return attr(href)
    }catch{}
    return"#"
  }
  const tokens:string[]=[]
  const tokenFor=(html:string)=>{
    const token=`\uE000${tokens.length}\uE000`
    tokens.push(html)
    return token
  }
  const richText=(body:string)=>esc(body).replace(/\n/g,"<br>")
  const sourceWithRich=source
    .replace(/\*\*__([\s\S]+?)__\*\*/g,(_match,body)=>tokenFor(`<strong style="font-weight:600"><span style="text-decoration:underline">${richText(body)}</span></strong>`))
    .replace(/__\*\*([\s\S]+?)\*\*__/g,(_match,body)=>tokenFor(`<strong style="font-weight:600"><span style="text-decoration:underline">${richText(body)}</span></strong>`))
    .replace(/\*\*([\s\S]+?)\*\*/g,(_match,body)=>tokenFor(`<strong style="font-weight:600">${richText(body)}</strong>`))
    .replace(/__([\s\S]+?)__/g,(_match,body)=>tokenFor(`<span style="text-decoration:underline">${richText(body)}</span>`))
  const restoreTokens=(html:string)=>html.replace(/\uE000(\d+)\uE000/g,(_match,idx)=>tokens[Number(idx)]||"")
  const fmt=(s:string)=>{
    const e=esc(s)
    return restoreTokens(e
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(_match,label,href)=>`<a href="${safeHref(href)}" style="color:var(--link-color,#3182F6);text-decoration:underline" target="_blank" rel="noopener noreferrer">${label}</a>`)
    )
  }
  const lines=sourceWithRich.split("\n")
  let html=""
  let inList=false
  for(let i=0;i<lines.length;i++){
    const raw=lines[i]
    if(raw.trim()==="---"){
      if(inList){html+="</ul>";inList=false}
      html+='<hr style="border:none;border-top:1px solid currentColor;opacity:0.15;margin:8px 0"/>'
    } else if(/^- /.test(raw)){
      if(!inList){html+='<ul style="margin:4px 0;padding-left:18px;list-style:disc">';inList=true}
      html+="<li style=\"margin:2px 0\">"+fmt(raw.slice(2))+"</li>"
    } else {
      if(inList){html+="</ul>";inList=false}
      html+=fmt(raw)+(i<lines.length-1?"<br>":"")
    }
  }
  if(inList)html+="</ul>"
  return html
}
function htmlToMd(html:string):string{
  return html
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi,"**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi,"**$1**")
    .replace(/<span[^>]*font-weight\s*:\s*(?:bold|[5-9]00)[^>]*>([\s\S]*?)<\/span>/gi,"**$1**")
    .replace(/<span[^>]*text-decoration:underline[^>]*>([\s\S]*?)<\/span>/gi,"__$1__")
    .replace(/<u>([\s\S]*?)<\/u>/gi,"__$1__")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,"[$2]($1)")
    .replace(/<hr[^>]*>/gi,"\n---\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi,"- $1\n")
    .replace(/<\/?ul[^>]*>/gi,"")
    .replace(/<\/?ol[^>]*>/gi,"")
    .replace(/<br\s*\/?>/gi,"\n")
    .replace(/<\/div>/gi,"\n")
    .replace(/<\/p>/gi,"\n")
    .replace(/<div[^>]*>/gi,"")
    .replace(/<p[^>]*>/gi,"")
    .replace(/<[^>]+>/g,"")
    .replace(/&nbsp;/g," ")
    .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&quot;|&#34;/g,'"').replace(/&apos;|&#39;/g,"'")
    .replace(/\n{3,}/g,"\n\n")
    .trimEnd()
}
function customPolicyTitle(cs:any){
  return String(cs?.customPolicyTitle||cs?.title||"법적 문서").trim()||"법적 문서"
}
function openCustomPolicyPreview(cs:any){
  if(typeof window==="undefined")return
  const title=customPolicyTitle(cs)
  const body=String(cs?.customPolicyBody||"").trim()
  if(!body)return
  const safeTitle=title.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  const html=`<!doctype html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${safeTitle}</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"/><style>body{margin:0;background:#f7f8fa;color:#191919;font-family:'Pretendard Variable','Pretendard','Noto Sans KR',-apple-system,sans-serif}.wrap{max-width:760px;margin:0 auto;padding:52px 22px 72px}.card{background:#fff;border:1px solid #e5e8eb;border-radius:16px;padding:34px 30px;box-shadow:0 12px 32px rgba(0,0,0,.06)}h1{margin:0 0 24px;font-size:26px;line-height:1.35;font-weight:700}.body{font-size:15px;line-height:1.8;color:#333}.body ul{padding-left:22px}.body a{color:#3182f6}@media(max-width:640px){.wrap{padding:24px 14px 48px}.card{padding:26px 20px;border-radius:12px}h1{font-size:22px}}</style></head><body><main class="wrap"><article class="card"><h1>${safeTitle}</h1><div class="body">${mdToHtml(body)}</div></article></main></body></html>`
  const url=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"}))
  window.open(url,"_blank","noopener,noreferrer")
  window.setTimeout(()=>URL.revokeObjectURL(url),60000)
}

// ─── ConsentBodyEditor ────────────────────────────────────────────────────
function handleEditorKey(e:React.KeyboardEvent<HTMLDivElement>,el:HTMLDivElement,onChange:(v:string)=>void){
  const sel=window.getSelection();if(!sel||!sel.rangeCount)return
  const range=sel.getRangeAt(0)
  if(e.key==="Enter"&&!e.shiftKey&&!e.metaKey&&!e.ctrlKey){
    e.preventDefault()
    let node:Node|null=range.startContainer
    while(node&&node!==el){
      if((node as HTMLElement).tagName==="LI"){
        if((node as HTMLElement).textContent?.trim()===""){
          const li=node as HTMLElement
          const ul=li.parentElement
          if(ul){ul.insertAdjacentHTML("afterend","<br>");ul.removeChild(li);if(!ul.children.length)ul.remove()}
        }else{
          document.execCommand("insertHTML",false,"</li><li>")
        }
        onChange(htmlToMd(el.innerHTML));return
      }
      node=node.parentNode
    }
    document.execCommand("insertLineBreak")
    onChange(htmlToMd(el.innerHTML))
    return
  }
  if(e.key===" "&&!e.shiftKey){
    const node=range.startContainer
    const textBefore=(node.textContent||"").slice(0,range.startOffset)
    if(textBefore==="-"){
      e.preventDefault()
      const parentEl=node.parentElement
      if(parentEl&&parentEl.tagName==="LI"){document.execCommand("insertText",false," ");return}
      const r2=range.cloneRange()
      r2.setStart(node,textBefore.length-1)
      r2.setEnd(node,textBefore.length)
      r2.deleteContents()
      document.execCommand("insertHTML",false,"<ul style='margin:4px 0;padding-left:18px;list-style:disc'><li></li></ul>")
      const lis=el.querySelectorAll("li")
      const last=lis[lis.length-1]
      if(last){const r3=document.createRange();r3.setStart(last,0);r3.collapse(true);sel.removeAllRanges();sel.addRange(r3)}
      onChange(htmlToMd(el.innerHTML));return
    }
    const triDash="---"
    if(textBefore===triDash){
      e.preventDefault()
      const r2=range.cloneRange()
      r2.setStart(node,textBefore.length-3)
      r2.setEnd(node,textBefore.length)
      r2.deleteContents()
      document.execCommand("insertHTML",false,'<hr style="border:none;border-top:1px solid currentColor;opacity:0.15;margin:8px 0"/><br>')
      onChange(htmlToMd(el.innerHTML));return
    }
  }
}
function editorContainsRange(el:HTMLDivElement,range:Range|null){
  if(!range)return false
  const node=range.commonAncestorContainer
  return node===el||el.contains(node)
}
function restoreEditorRange(range:Range|null){
  if(!range)return false
  const sel=window.getSelection()
  if(!sel)return false
  try{
    sel.removeAllRanges()
    sel.addRange(range)
    return true
  }catch{return false}
}
function placeCaretAtEditorEnd(el:HTMLDivElement){
  const range=document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const sel=window.getSelection()
  if(sel){sel.removeAllRanges();sel.addRange(range)}
}
function syncEditorHtmlView(el:HTMLDivElement,nextValue:string,placeAtEnd=false){
  const rendered=mdToHtml(nextValue)
  if(el.innerHTML!==rendered)el.innerHTML=rendered
  if(placeAtEnd)placeCaretAtEditorEnd(el)
}
function ConsentBodyEditor({value,onChange,A}:{value:string;onChange:(v:string)=>void;A:AT}){
  const edRef=React.useRef<HTMLDivElement>(null)
  const savedRangeRef=React.useRef<Range|null>(null)
  const [showLink,setShowLink]=React.useState(false)
  const [linkUrl,setLinkUrl]=React.useState("")
  const [isFocused,setIsFocused]=React.useState(false)
  const FONT2="'Pretendard Variable','Pretendard',sans-serif"
  // Convert markdown → HTML whenever value changes from outside (not while editing)
  React.useEffect(()=>{
    const el=edRef.current;if(!el||isFocused)return
    const current=htmlToMd(el.innerHTML)
    if(current===value)return  // no-op if already in sync
    el.innerHTML=mdToHtml(value)
  },[value,isFocused])

  const saveSelection=()=>{
    const el=edRef.current
    const sel=window.getSelection()
    if(!el||!sel||!sel.rangeCount)return
    const range=sel.getRangeAt(0)
    if(editorContainsRange(el,range))savedRangeRef.current=range.cloneRange()
  }
  const commitHtml=()=>{
    const el=edRef.current;if(!el)return
    const nextValue=htmlToMd(el.innerHTML)
    onChange(nextValue)
    return nextValue
  }

  const applyFormat=(cmd:"bold"|"underline")=>{
    const el=edRef.current;if(!el)return
    const sel=window.getSelection()
    const currentRange=sel&&sel.rangeCount>0?sel.getRangeAt(0):null
    const range=editorContainsRange(el,currentRange)?currentRange:(editorContainsRange(el,savedRangeRef.current)?savedRangeRef.current:null)
    if(range&&!range.collapsed&&el.contains(range.commonAncestorContainer)){
      restoreEditorRange(range)
      const wrapper=cmd==="bold"?document.createElement("strong"):document.createElement("span")
      if(cmd==="bold")wrapper.style.fontWeight="600"
      else wrapper.style.textDecoration="underline"
      wrapper.appendChild(range.extractContents())
      range.insertNode(wrapper)
      const nextRange=document.createRange()
      nextRange.setStartAfter(wrapper)
      nextRange.collapse(true)
      sel.removeAllRanges()
      sel.addRange(nextRange)
      setIsFocused(true)
      const nextValue=htmlToMd(el.innerHTML)
      onChange(nextValue)
      syncEditorHtmlView(el,nextValue,true)
      savedRangeRef.current=null
      return
    }
    el.focus()
    document.execCommand(cmd,false)
    const nextValue=htmlToMd(el.innerHTML)
    onChange(nextValue)
    syncEditorHtmlView(el,nextValue,true)
  }
  const insertLink=()=>{
    const el=edRef.current;if(!el||!linkUrl.trim())return
    el.focus()
    // Restore saved selection
    if(savedRangeRef.current){
      const sel=window.getSelection()
      if(sel){sel.removeAllRanges();sel.addRange(savedRangeRef.current)}
    }
    const sel=window.getSelection()
    const selText=sel&&sel.toString().trim()
    const label=selText||linkUrl.trim()
    document.execCommand("insertHTML",false,`<a href="${linkUrl.trim()}" style="color:${A.blue};text-decoration:underline" target="_blank">${label}</a>`)
    onChange(htmlToMd(el.innerHTML))
    setShowLink(false);setLinkUrl("");savedRangeRef.current=null
  }

  const btnS:React.CSSProperties={width:36,height:34,borderRadius:8,border:`1px solid ${A===ALT?"#E3E7EC":A.border}`,background:A.card,cursor:"pointer",color:A.t2,fontFamily:FONT2,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center"}
  return <div style={{position:"relative"}}>
    <div style={{position:"sticky" as const,top:0,zIndex:5,background:A.card,padding:"0 0 6px",marginBottom:5}}>
      <div style={{display:"flex",gap:4,alignItems:"center"}}>
        <button onMouseDown={e=>{e.preventDefault();applyFormat("bold")}} title="굵게" style={{...btnS,fontWeight:600}}>B</button>
        <button onMouseDown={e=>{e.preventDefault();applyFormat("underline")}} title="밑줄" style={{...btnS,textDecoration:"underline"}}>U</button>
        <button onMouseDown={e=>{e.preventDefault();
          // Save current selection before input opens and steals focus
          const sel=window.getSelection()
          if(sel&&sel.rangeCount>0)savedRangeRef.current=sel.getRangeAt(0).cloneRange()
          setShowLink(v=>!v);setLinkUrl("")}} title="링크" style={btnS}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5a4.24 4.24 0 0 0 6 0l2-2a4.24 4.24 0 0 0-6-6L7 3M9.5 6.5a4.24 4.24 0 0 0-6 0l-2 2a4.24 4.24 0 0 0 6 6L9 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </button>
        <div style={{width:1,height:18,background:A.border,margin:"0 2px"}}/>
        <button onMouseDown={e=>{e.preventDefault();const el=edRef.current;if(!el)return;el.focus();
          const sel=window.getSelection();if(!sel||!sel.rangeCount)return;
          const range=sel.getRangeAt(0);const text=sel.toString();
          if(text){range.deleteContents();range.insertNode(document.createTextNode("- "+text));sel.collapseToEnd()}
          else{document.execCommand("insertText",false,"- ")}
          onChange(htmlToMd(el.innerHTML))}} title="불렛 리스트" style={btnS}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="2.5" cy="4" r="1.2" fill="currentColor"/><circle cx="2.5" cy="8" r="1.2" fill="currentColor"/><circle cx="2.5" cy="12" r="1.2" fill="currentColor"/><path d="M5.5 4h9M5.5 8h9M5.5 12h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </button>
        <button onMouseDown={e=>{e.preventDefault();const el=edRef.current;if(!el)return;el.focus();document.execCommand("insertHTML",false,'<hr style="border:none;border-top:1px solid currentColor;opacity:0.2;margin:6px 0"/><br>');onChange(htmlToMd(el.innerHTML))}} title="구분선" style={btnS}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M4 4h8M4 12h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/></svg>
        </button>
        <span style={{fontSize:12,color:A.t3,marginLeft:2}}>텍스트 선택 후 클릭</span>
      </div>
      {showLink&&<div style={{display:"flex",gap:5,marginTop:6,alignItems:"center"}}>
        <input value={linkUrl} onChange={e=>setLinkUrl(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")insertLink()}}
          placeholder="https://..."
          autoFocus
          style={{flex:1,background:A.card,border:`1px solid ${A.blue}`,borderRadius:A.r,color:A.t1,fontFamily:FONT2,fontSize:12,padding:"5px 9px",outline:"none",boxSizing:"border-box" as const}}/>
        <button onClick={insertLink} style={{height:26,padding:"0 10px",borderRadius:A.r,border:"none",background:A.blue,color:"#fff",fontFamily:FONT2,fontSize:12,cursor:"pointer",fontWeight:600}}>삽입</button>
        <button onClick={()=>{setShowLink(false);setLinkUrl("")}} style={{height:26,padding:"0 8px",borderRadius:A.r,border:`1px solid ${A.border}`,background:"transparent",color:A.t2,fontFamily:FONT2,fontSize:12,cursor:"pointer"}}>취소</button>
      </div>}
    </div>
    <div
      ref={edRef}
      contentEditable
      suppressContentEditableWarning
      onFocus={e=>{
        setIsFocused(true)
        const el=e.currentTarget as HTMLDivElement
        if((el.textContent||"").includes("**"))syncEditorHtmlView(el,htmlToMd(el.innerHTML),true)
      }}
      onMouseUp={saveSelection}
      onKeyUp={saveSelection}
      onBlur={e=>{setIsFocused(false);onChange(htmlToMd((e.currentTarget as HTMLDivElement).innerHTML))}}
      onInput={()=>{commitHtml();saveSelection()}}
      onKeyDown={e=>{const el=edRef.current;if(el)handleEditorKey(e,el,onChange)}}
      style={{width:"100%",minHeight:132,background:panelFieldBg(A),border:"none",borderRadius:10,color:A.t1,fontFamily:FONT2,fontSize:13.5,padding:"13px 14px",outline:"none",lineHeight:1.7,boxSizing:"border-box" as const,wordBreak:"break-word" as const,cursor:"text",boxShadow:isFocused?`inset 0 0 0 1.5px ${A.blue}`:"none",transition:"box-shadow .15s"}}
    />
  </div>
}

// ─── ConsentBodyPreview ───────────────────────────────────────────────────
function ConsentBodyPreview({body,accentColor,FC,noBorder,noAccordion}:{body:string;accentColor:string;FC:any;noBorder?:boolean;noAccordion?:boolean}){
  const [open,setOpen]=React.useState(false)
  const FONT2="'Pretendard Variable','Pretendard',sans-serif"
  const lines=body.split("\n")
  const LIMIT=3
  const needsAccordion=!noAccordion&&lines.length>LIMIT
  const visible=needsAccordion&&!open?lines.slice(0,LIMIT).join("\n"):body
  // Render markdown → rich HTML inline
  const html=mdToHtml(visible)
  return <div style={{borderTop:noBorder?"none":`1px solid ${FC.fieldBorder}`,paddingTop:noBorder?0:10,marginBottom:noBorder?0:10}}>
    <div style={{fontSize:12,color:FC.t2,lineHeight:1.7,fontFamily:FONT2}}
      dangerouslySetInnerHTML={{__html:html}}/>
    {needsAccordion&&<button onClick={()=>setOpen(v=>!v)}
      style={{display:"flex",alignItems:"center",gap:4,marginTop:4,background:"none",border:"none",cursor:"pointer",color:accentColor,fontFamily:FONT2,fontSize:11.5,fontWeight:600,padding:0}}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {open?"접기":"전체 보기"}
    </button>}
  </div>
}

// ─── ProgramPicker — category grid → program list ────────────────────────

function ProgramPicker({progs,cats,brand,value,onChange,A}:{progs:Prog[];cats:Cat[];brand:string;value:string;onChange:(p:Prog)=>void;A:AT}) {
  const [open,setOpen]=React.useState(false)
  const [query,setQuery]=React.useState("")

  // 카테고리 목록은 Supabase `categories` 테이블의 brand 컬럼을 그대로 따른다.
  const brandCats = cats.filter(c=>canonicalBrand(c.brand||"")===canonicalBrand(brand||""))
  // 아직 해당 브랜드로 등록된 카테고리가 없으면 기존 동작대로 스나이퍼팩토리 기준을 쓴다.
  const usableCats = brandCats.length ? brandCats : cats.filter(c=>canonicalBrand(c.brand||"")==="SNIPERFACTORY")
  const allowedCatIdSet = new Set(usableCats.map(c=>c.id))
  const catNameOf = (catId:string|undefined) => cats.find(c=>c.id===catId)?.name||""
  const isAllowedCat = (catId:string|undefined) => !!catId && allowedCatIdSet.has(catId)
  const allPrograms = progs.filter(p=>isAllowedCat(p.category))
  const selected = progs.find(p=>p.id===value)

  const needle=query.trim().toLowerCase()
  // 유형 단계 없이 전체 과정을 한 목록에 두고, 유형은 그룹 헤더로만 구분한다.
  const groups = usableCats.map(cat=>({
    id:cat.id,
    name:cat.name,
    items:allPrograms.filter(p=>p.category===cat.id&&(!needle||p.title.toLowerCase().includes(needle))),
  })).filter(g=>g.items.length>0)
  const totalHits = groups.reduce((n,g)=>n+g.items.length,0)

  React.useEffect(()=>{if(!open)setQuery("")},[open])

  return <div style={{position:"relative" as const}}>
    {/* 트리거 */}
    <button type="button" onClick={()=>setOpen(v=>!v)}
      style={{width:"100%",height:46,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"0 14px",borderRadius:10,border:"none",
        background:panelFieldBg(A),color:selected?A.t1:A.t3,fontFamily:FONT,fontSize:13,fontWeight:500,cursor:"pointer",textAlign:"left" as const,
        boxShadow:open?`inset 0 0 0 1.5px ${A.blue}`:"none",transition:"box-shadow .12s"}}>
      <span style={{minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>
        {selected?selected.title:"과정을 선택해 주세요."}
      </span>
      <svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{flexShrink:0,color:A.t3,transform:open?"rotate(180deg)":"none",transition:"transform .15s"}}>
        <path d="M2 3.5 5 6.5l3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>

    {open&&<>
      <div onClick={()=>setOpen(false)} style={{position:"fixed" as const,inset:0,zIndex:59}}/>
      <div style={{position:"absolute" as const,top:52,left:0,right:0,zIndex:60,borderRadius:12,overflow:"hidden",background:A.card,
        border:A===ALT?"none":`1px solid ${A.border}`,boxShadow:"0 1px 2px rgba(16,24,40,.08), 0 16px 40px -10px rgba(16,24,40,.28)"}}>
        {/* 검색 — 유형을 고르지 않아도 전체 과정에서 바로 찾을 수 있다 */}
        <div style={{padding:10,boxShadow:`inset 0 -1px 0 ${A.border}`}}>
          <div style={{height:36,display:"flex",alignItems:"center",gap:8,padding:"0 11px",borderRadius:9,background:panelFieldBg(A)}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{color:A.t3,flexShrink:0}}>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="과정명 검색"
              style={{flex:1,minWidth:0,border:"none",outline:"none",background:"transparent",color:A.t1,fontFamily:FONT,fontSize:12.5}}/>
            {query&&<button type="button" onClick={()=>setQuery("")} aria-label="검색어 지우기"
              style={{width:18,height:18,flexShrink:0,border:"none",borderRadius:5,background:"transparent",color:A.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
            </button>}
          </div>
        </div>

        <div style={{maxHeight:300,overflowY:"auto" as const,padding:6}}>
          {totalHits===0
            ? <div style={{padding:"28px 12px",textAlign:"center" as const,color:A.t3,fontSize:12.5,lineHeight:1.6}}>
                {allPrograms.length===0?"선택 가능한 교육과정이 없어요.":"검색 결과가 없어요."}
              </div>
            : groups.map(group=>(
              <div key={group.id}>
                <div style={{display:"flex",alignItems:"center",gap:6,padding:"9px 10px 6px"}}>
                  <span style={{fontSize:11.5,fontWeight:700,color:A.t3,letterSpacing:".3px"}}>{group.name}</span>
                  <span style={{fontSize:11,fontWeight:600,color:A.t4}}>{group.items.length}</span>
                </div>
                {group.items.map(p=>{
                  const sel=p.id===value
                  return <button key={p.id} type="button" onClick={()=>{onChange(p);setOpen(false)}}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:9,border:"none",
                      background:sel?panelFieldBg(A):"transparent",color:sel?A.t1:A.t2,fontFamily:FONT,fontSize:12.5,fontWeight:sel?700:500,
                      cursor:"pointer",textAlign:"left" as const,lineHeight:1.45}}
                    onMouseEnter={e=>{if(!sel)(e.currentTarget as HTMLElement).style.background=panelFieldBg(A)}}
                    onMouseLeave={e=>{if(!sel)(e.currentTarget as HTMLElement).style.background="transparent"}}>
                    <span style={{flex:1,minWidth:0}}>{p.title}</span>
                    {sel&&<svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{flexShrink:0,color:A.blue}}><path d="M1.5 5.2 3.8 7.5 8.5 2.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                })}
              </div>
            ))}
        </div>
      </div>
    </>}
  </div>
}

export function FormAdmin(props:{width?:number;height?:number;supabaseUrl?:string;supabaseAnonKey?:string;formBaseUrl?:string;googleSheetsWebhookUrl?:string}) {
  const {width=1280,height=820,supabaseUrl="",supabaseAnonKey="",formBaseUrl="",googleSheetsWebhookUrl=""}=props
  const supa=React.useMemo(()=>getSB(supabaseUrl,supabaseAnonKey),[supabaseUrl,supabaseAnonKey])

  // ── Admin theme ────────────────────────────────────────────────────────
  const [adminDark,setAdminDark]=React.useState(false)
  const A=adminDark?ADK:ALT

  // ── Views: login | dashboard | builder | analytics ────────────────────
  const [view,setView]=React.useState<"login"|"dashboard"|"builder"|"analytics">("login")

  // ── Auth ──────────────────────────────────────────────────────────────
  const [authUser,setAuthUser]=React.useState<any>(null)
  const [authRole,setAuthRole]=React.useState<AdminRole>("")
  const [loginEmail,setLoginEmail]=React.useState("")
  const [loginPw,setLoginPw]=React.useState("")
  const [loginErr,setLoginErr]=React.useState("")
  const [loginLoading,setLoginLoading]=React.useState(false)

  // ── Dashboard data ─────────────────────────────────────────────────────
  const [snList,setSnList]=React.useState<any[]>([])
  const [ioList,setIoList]=React.useState<any[]>([])
  const [sfacList,setSfacList]=React.useState<any[]>([])
  const [dashLoading,setDashLoading]=React.useState(false)
  const [dashLoadingMore,setDashLoadingMore]=React.useState(false)
  const [dashHasMore,setDashHasMore]=React.useState(true)
  const [dashNextOffset,setDashNextOffset]=React.useState(0)
  const dashTableScrollRef=React.useRef<HTMLDivElement|null>(null)
  const [showBrandModal,setShowBrandModal]=React.useState(false)
  const [showGuide,setShowGuide]=React.useState(false)
  const [dashBrandFilter,setDashBrandFilter]=React.useState("")
  const [dashProgramFilter,setDashProgramFilter]=React.useState("")
  const [dashProgramGroupFilter,setDashProgramGroupFilter]=React.useState("")
  const [dashShowEmptyGroups,setDashShowEmptyGroups]=React.useState(false)
  const [showCustomAppType,setShowCustomAppType]=React.useState(false)
  const [openConsentIdx,setOpenConsentIdx]=React.useState<Record<number,boolean>>({})
  const [syncAdvOpen,setSyncAdvOpen]=React.useState(false)
  React.useEffect(()=>{
    const rgb=adminDark?"255,255,255":"141,149,163"
    const id="cf-admin-scrollbar-style"
    let tag=document.getElementById(id) as HTMLStyleElement|null
    if(!tag){tag=document.createElement("style");tag.id=id;document.head.appendChild(tag)}
    // 트랙 배경 없이 얇은 디바이더처럼. 실제 노출 두께는 7px - 좌우 테두리 2px = 3px.
    // 진하기는 --cf-sb-a 로 제어하고, 아래 effect에서 스크롤 시작/종료에 맞춰 페이드시킨다.
    tag.textContent=`
      *::-webkit-scrollbar{width:7px;height:7px}
      *::-webkit-scrollbar-track{background:transparent}
      *::-webkit-scrollbar-corner{background:transparent}
      *::-webkit-scrollbar-thumb{background-color:rgba(${rgb},var(--cf-sb-a,0));border:2px solid transparent;background-clip:padding-box;border-radius:999px}
      *{scrollbar-width:thin;scrollbar-color:rgba(${rgb},var(--cf-sb-a,0)) transparent}
    `
  },[adminDark])
  const scrollbarPeakAlpha=adminDark?0.34:0.5
  React.useEffect(()=>{
    const FADE_IN=140, FADE_OUT=320, HOLD=700
    const anims=new WeakMap<Element,{raf:number;timer:any;alpha:number}>()
    const animate=(el:HTMLElement,to:number,duration:number)=>{
      const state=anims.get(el)||{raf:0,timer:0,alpha:0}
      anims.set(el,state)
      cancelAnimationFrame(state.raf)
      const from=state.alpha
      if(from===to)return
      const startedAt=performance.now()
      const step=(now:number)=>{
        const progress=Math.min(1,(now-startedAt)/duration)
        const alpha=from+(to-from)*progress
        state.alpha=alpha
        el.style.setProperty("--cf-sb-a",String(Math.round(alpha*1000)/1000))
        if(progress<1)state.raf=requestAnimationFrame(step)
      }
      state.raf=requestAnimationFrame(step)
    }
    const onScroll=(e:Event)=>{
      const el=e.target as HTMLElement|null
      if(!el||el.nodeType!==1||!el.style)return
      const state=anims.get(el)||{raf:0,timer:0,alpha:0}
      anims.set(el,state)
      clearTimeout(state.timer)
      animate(el,scrollbarPeakAlpha,FADE_IN)
      state.timer=setTimeout(()=>animate(el,0,FADE_OUT),HOLD)
    }
    document.addEventListener("scroll",onScroll,true)
    return ()=>document.removeEventListener("scroll",onScroll,true)
  },[scrollbarPeakAlpha])
  const courseTabsRef=React.useRef<HTMLDivElement|null>(null)
  const [courseTabsArrows,setCourseTabsArrows]=React.useState({left:false,right:false})
  const syncCourseTabsArrows=React.useCallback(()=>{
    const el=courseTabsRef.current
    if(!el){setCourseTabsArrows({left:false,right:false});return}
    const max=el.scrollWidth-el.clientWidth
    setCourseTabsArrows({left:el.scrollLeft>2,right:max>2&&el.scrollLeft<max-2})
  },[])
  const scrollCourseTabs=(dir:1|-1)=>{
    const el=courseTabsRef.current
    if(!el)return
    el.scrollBy({left:dir*Math.max(200,Math.round(el.clientWidth*0.7)),behavior:"smooth"})
  }
  const [dashTopTypeFilter,setDashTopTypeFilter]=React.useState<DashboardFormType|"" >("")
  const [dashTopStatusFilter,setDashTopStatusFilter]=React.useState<DashboardManualStatus|"" >("")
  const [dashQuery,setDashQuery]=React.useState("")
  const [dashResponseCounts,setDashResponseCounts]=React.useState<Record<string,number>>({})
  const [dashboardSettings,setDashboardSettings]=React.useState<DashboardSettingsState|null>(null)
  const [dashboardSettingsSaving,setDashboardSettingsSaving]=React.useState(false)
  const [editPasswordPrompt,setEditPasswordPrompt]=React.useState<null|{item:any;password:string;error:string;checking:boolean}>(null)
  const [recentEditIds,setRecentEditIds]=React.useState<string[]>([])
  React.useEffect(()=>{
    try{
      const raw=window.localStorage.getItem(RECENT_EDIT_STORAGE_KEY)
      const parsed=raw?JSON.parse(raw):[]
      if(Array.isArray(parsed))setRecentEditIds(parsed.filter((id:any)=>typeof id==="string"))
    }catch{}
  },[])
  function markFormRecentlyEdited(id:string){
    if(!id)return
    setRecentEditIds(prev=>{
      const next=[id,...prev.filter(item=>item!==id)].slice(0,RECENT_EDIT_LIMIT)
      try{window.localStorage.setItem(RECENT_EDIT_STORAGE_KEY,JSON.stringify(next))}catch{}
      return next
    })
  }
  const [formTrashOpen,setFormTrashOpen]=React.useState(false)
  const [formTrashItems,setFormTrashItems]=React.useState<any[]>([])
  const [formTrashBusy,setFormTrashBusy]=React.useState("")
  const [guideData,setGuideData]=React.useState<{topics:any[]}|null>(null)
  const [guideLoading,setGuideLoading]=React.useState(false)
  const [guideTopic,setGuideTopic]=React.useState(0)
  const [guidePage,setGuidePage]=React.useState(0)
  const [pendingBrand,setPendingBrand]=React.useState<BrandId|null>(null)
  const [showTemplateModal,setShowTemplateModal]=React.useState(false)

  // ── Builder cfg ────────────────────────────────────────────────────────
  const [cfg,setCfg]=React.useState<Cfg>(dc(DEF))
  const [currentBrand,setCurrentBrand]=React.useState("")
  const [loadedId,setLoadedId]=React.useState("")
  const [loadedName,setLoadedName]=React.useState("")
  const [savedSlug,setSavedSlug]=React.useState("")
  const [progs,setProgs]=React.useState<Prog[]>([])
  const [cats,setCats]=React.useState<Cat[]>([])
  const [programCatalogLoading,setProgramCatalogLoading]=React.useState(false)
  const [programCatalogErr,setProgramCatalogErr]=React.useState("")
  const [sbSt,setSbSt]=React.useState<"idle"|"ok"|"err">("idle")
  const programCatalogRequestRef=React.useRef(0)

  // ── Builder UI state ───────────────────────────────────────────────────
  const [sec,setSec]=React.useState("header")
  // 동의 탭에 들어올 때마다 아코디언을 모두 접는다.
  React.useEffect(()=>{if(sec==="consent")setOpenConsentIdx({})},[sec])
  const [pvTab,setPvTab]=React.useState<"form"|"link">("form")
  const [saved,setSaved]=React.useState<any[]>([])
  React.useEffect(()=>{
    syncCourseTabsArrows()
    const el=courseTabsRef.current
    if(!el)return
    const observer=typeof ResizeObserver!=="undefined"?new ResizeObserver(()=>syncCourseTabsArrows()):null
    observer?.observe(el)
    window.addEventListener("resize",syncCourseTabsArrows)
    return ()=>{observer?.disconnect();window.removeEventListener("resize",syncCourseTabsArrows)}
  },[view,dashShowEmptyGroups,dashBrandFilter,dashProgramGroupFilter,cats.length,saved.length,syncCourseTabsArrows])
  const [editorTabs,setEditorTabs]=React.useState<EditorTab[]>([])
  const [activeEditorTabKey,setActiveEditorTabKey]=React.useState("")
  const [saving,setSaving]=React.useState(false)
  const [autoSaving,setAutoSaving]=React.useState(false)
  const [autoSaved,setAutoSaved]=React.useState(false)
  const autoSaveTimer=React.useRef<any>(null)
  const [showSave,setShowSave]=React.useState(false)
  const [saveName,setSaveName]=React.useState("")
  const [ctxMenu,setCtxMenu]=React.useState<{x:number;y:number;item:any;source?:string}|null>(null)
  const fullFormCache=React.useRef<Record<string,{updatedAt?:string;data:any}>>({})
  const fullFormRequests=React.useRef<Record<string,Promise<any>>>({})
  const fullFormPrefetchQueue=React.useRef<any[]>([])
  const fullFormPrefetchActive=React.useRef(0)
  const [saveSlug,setSaveSlug]=React.useState("")
  const [saveErr,setSaveErr]=React.useState("")
  const [showUpdateModal,setShowUpdateModal]=React.useState(false)
  const [renameModal,setRenameModal]=React.useState<{id:string;name:string}|null>(null)
  const [renameName,setRenameName]=React.useState("")
  const [newLbl,setNewLbl]=React.useState("")
  const [newVal,setNewVal]=React.useState("")
  const [slugDraft,setSlugDraft]=React.useState("")
  const [qrMode,setQrMode]=React.useState<"form"|"custom">("form")
  const [qrCustomUrl,setQrCustomUrl]=React.useState("")
  const [qrGeneratedUrl,setQrGeneratedUrl]=React.useState("")
  const [qrGeneratedMatrix,setQrGeneratedMatrix]=React.useState<boolean[][]|null>(null)
  const [qrGeneratedError,setQrGeneratedError]=React.useState("")
  const [showAnalyticsTip,setShowAnalyticsTip]=React.useState(false)
  const [showBuilderSettingsTip,setShowBuilderSettingsTip]=React.useState(false)
  const [actionLoading,setActionLoading]=React.useState("")
  const [analyticsInfoTip,setAnalyticsInfoTip]=React.useState("")
  const [analyticsTopTip,setAnalyticsTopTip]=React.useState("")
  const [showDeleteAllAnalytics,setShowDeleteAllAnalytics]=React.useState(false)
  const [showAnalyticsDeleteMenu,setShowAnalyticsDeleteMenu]=React.useState(false)
  const [editResponse,setEditResponse]=React.useState<null|{row:any;values:Record<string,string> }>(null)
  const [editResponseSaving,setEditResponseSaving]=React.useState(false)
  const [imageCropModal,setImageCropModal]=React.useState<null|{
    target:"header"|"field"|"ad"
    fieldId?:string
    imageUrl:string
    imageFit:"contain"|"cover"
    imagePosX:number
    imagePosY:number
    imageCropX:number
    imageCropY:number
    imageCropW:number
    imageCropH:number
    imageNaturalW:number
    imageNaturalH:number
  }>(null)
  const [filePreview,setFilePreview]=React.useState<null|{name:string;url:string;type?:string;size?:number;path?:string;bucket?:string}>(null)

  // ── Analytics state ───────────────────────────────────────────────────
  const [analyticsTab,setAnalyticsTab]=React.useState<"questions"|"responses"|"period"|"dropoff"|"qr">("responses")
  const [analyticsResponseScope,setAnalyticsResponseScope]=React.useState<"submitted"|"draft">("submitted")
  const [analyticsCsvSort,setAnalyticsCsvSort]=React.useState<"desc"|"asc">("desc")
  const [qrAnalyticsScope,setQrAnalyticsScope]=React.useState<"form"|"detail">("form")
  const [analyticsRows,setAnalyticsRows]=React.useState<any[]>([])
  const [selectedAnalyticsRowIds,setSelectedAnalyticsRowIds]=React.useState<string[]>([])
  const [expandedDuplicateResponseGroups,setExpandedDuplicateResponseGroups]=React.useState<string[]>([])
  const [analyticsEvents,setAnalyticsEvents]=React.useState<any[]>([])
  const [analyticsTrashEvents,setAnalyticsTrashEvents]=React.useState<any[]>([])
  const [showAnalyticsTrash,setShowAnalyticsTrash]=React.useState(false)
  const [analyticsTrashBusy,setAnalyticsTrashBusy]=React.useState(false)
  const [analyticsSelectedDeleteBusy,setAnalyticsSelectedDeleteBusy]=React.useState(false)
  const [analyticsLoading,setAnalyticsLoading]=React.useState(false)
  const [analyticsErr,setAnalyticsErr]=React.useState("")
  const [analyticsQuestionId,setAnalyticsQuestionId]=React.useState("")
  const [analyticsSection,setAnalyticsSection]=React.useState(1)
  const [analyticsHoverSlice,setAnalyticsHoverSlice]=React.useState<number|null>(null)
  const [analyticsHoverPoint,setAnalyticsHoverPoint]=React.useState<{x:number;y:number}|null>(null)
  const [analyticsQuestionQuery,setAnalyticsQuestionQuery]=React.useState("")
  const [analyticsColumnWidths,setAnalyticsColumnWidths]=React.useState<Record<string,number>>({})
  const [periodHover,setPeriodHover]=React.useState<null|{scope:string;x:number;y:number;title:string;color:string;lines:string[]}>(null)

  // ── Preview interactive states (must be at top level - Rules of Hooks) ─
  const [pvName,setPvName]=React.useState("")
  const [pvPhone,setPvPhone]=React.useState("")
  const [pvEmail,setPvEmail]=React.useState("")
  const [pvSrc,setPvSrc]=React.useState("")
  const [pvEtc,setPvEtc]=React.useState("")
  const [pvOk,setPvOk]=React.useState(false)
  const [pvShowModal,setPvShowModal]=React.useState(false)
  const [pvDd,setPvDd]=React.useState(false)
  const [pvPage,setPvPage]=React.useState(1)
  const [pvPageHistory,setPvPageHistory]=React.useState<number[]>([])
  const [rightPanelW,setRightPanelW]=React.useState(344)
  const isResizingRef=React.useRef(false)
  const [pvFieldVals,setPvFieldVals]=React.useState<Record<string,string>>({})
  const [pvFieldErrors,setPvFieldErrors]=React.useState<Record<string,string>>({})
  const [pvFieldChecked,setPvFieldChecked]=React.useState<Record<string,string[]>>({})
  const [pvDropOpen,setPvDropOpen]=React.useState<Record<string,boolean>>({})
  const [pvDpY,setPvDpY]=React.useState<Record<string,number>>({})
  const [pvDpM,setPvDpM]=React.useState<Record<string,number>>({})
  const [pvDpD,setPvDpD]=React.useState<Record<string,number>>({})
  const [dragIdx,setDragIdx]=React.useState<number|null>(null)
  const [dragOver,setDragOver]=React.useState<number|null>(null)
  const [dragInsertAt,setDragInsertAt]=React.useState<number|null>(null)
  const [replaceId,setReplaceId]=React.useState<string|null>(null)
  const [replacePos,setReplacePos]=React.useState<{top:number;right:number}|null>(null)
  const [selectedFieldId,setSelectedFieldId]=React.useState<string|null>(null)
  const [editIdx,setEditIdx]=React.useState<number|null>(null)
  const [showAddField,setShowAddField]=React.useState(false)
  const addFieldBtnRef=React.useRef<HTMLButtonElement|null>(null)
  const [addFieldMenuTop,setAddFieldMenuTop]=React.useState(118)
  // 메뉴를 '+ 질문 추가' 버튼 높이에 맞춰 띄우되, 화면 밖으로 넘치지 않게 위아래로 보정한다.
  function openAddFieldMenu(){
    const rect=addFieldBtnRef.current?.getBoundingClientRect()
    if(rect){
      const min=118
      const max=Math.max(min,window.innerHeight-240)
      setAddFieldMenuTop(Math.min(Math.max(rect.top,min),max))
    }
    setShowAddField(true)
  }
  const [panelDragIdx,setPanelDragIdx]=React.useState<number|null>(null)
  const [panelDragOver,setPanelDragOver]=React.useState<number|null>(null)
  const [sectionDragIdx,setSectionDragIdx]=React.useState<number|null>(null)
  const [sectionDragOver,setSectionDragOver]=React.useState<number|null>(null)
  const [sectionDragInsertAt,setSectionDragInsertAt]=React.useState<number|null>(null)
  const [optionDrag,setOptionDrag]=React.useState<null|{fieldIdx:number;optIdx:number}>(null)
  const [optionDragOver,setOptionDragOver]=React.useState<null|{fieldIdx:number;optIdx:number}>(null)
  // Consent body editor states (one per consent slot, using index 0-2)
  const [consentLinkShow,setConsentLinkShow]=React.useState<boolean[]>([false,false,false])
  const [consentLinkUrl,setConsentLinkUrl]=React.useState<string[]>(["","",""])
  const [consentPendingSel,setConsentPendingSel]=React.useState<({s:number;e:number;text:string}|null)[]>([null,null,null])
  const [consentBodyOpen,setConsentBodyOpen]=React.useState<boolean[]>([false,false,false])
  const consentBodyRefs=[React.useRef<HTMLTextAreaElement>(null),React.useRef<HTMLTextAreaElement>(null),React.useRef<HTMLTextAreaElement>(null)]
  // Options panel
  const [optFieldIdx2,setOptFieldIdx2]=React.useState(0)
  const [pvKdtVals,setPvKdtVals]=React.useState<Record<string,string>>({})
  const [pvKdtDrops,setPvKdtDrops]=React.useState<Record<string,boolean>>({})

  // ── Toast ─────────────────────────────────────────────────────────────
  const [toast,setToast]=React.useState<{msg:string;ok:boolean;undo?:()=>void}|null>(null)
  const [toastLeaving,setToastLeaving]=React.useState(false)
  const toastRef=React.useRef<any>(null)
  const [deletedField,setDeletedField]=React.useState<{field:FormField;idx:number}|null>(null)
  const [appUpdateAvailable,setAppUpdateAvailable]=React.useState(false)
  const appVersionRef=React.useRef("")
  const linkedProgramResponseSyncRef=React.useRef<Record<string,string>>({})
  const dashboardRefreshTimer=React.useRef<any>(null)
  const dashboardRefreshBusy=React.useRef(false)
  React.useEffect(()=>{setSlugDraft(savedSlug||saveSlug||"")},[savedSlug,saveSlug])
  React.useEffect(()=>{
    if(!optionDrag||typeof window==="undefined")return
    const clear=()=>{
      setOptionDrag(null)
      setOptionDragOver(null)
      setPanelDragIdx(null)
      setPanelDragOver(null)
      setEditIdx(optionDrag.fieldIdx)
    }
    window.addEventListener("dragend",clear)
    window.addEventListener("drop",clear)
    return()=>{
      window.removeEventListener("dragend",clear)
      window.removeEventListener("drop",clear)
    }
  },[optionDrag])
  function showToast(msg:string,ok=true,undo?:()=>void){
    setToastLeaving(false)
    setToast({msg,ok,undo})
    clearTimeout(toastRef.current)
    toastRef.current=setTimeout(()=>{
      setToastLeaving(true)
      setTimeout(()=>{setToast(null);setToastLeaving(false)},300)
    },4000)
  }
  function linkedProgramIdOf(source:Cfg){
    if(source.header?.programUnlinked)return""
    return String(source.header?.programId||"").trim()
  }
  async function syncLinkedProgramResponses(formId:string,source:Cfg,opts:{notify?:boolean}={}){
    const isUnlinked=!!source.header?.programUnlinked
    const programId=linkedProgramIdOf(source)
    if(!supa||!formId||(!isUnlinked&&!programId))return
    const syncKey=isUnlinked?"__unlinked__":programId
    if(linkedProgramResponseSyncRef.current[formId]===syncKey)return
    linkedProgramResponseSyncRef.current[formId]=syncKey
    const tables=["applications","company_applications"]
    const errors:string[]=[]
    const patch:{program_id:string|null}={program_id:isUnlinked?null:programId}
    await Promise.all(tables.map(async table=>{
      const {error}=await supa.from(table).update(patch).eq("form_id",formId)
      if(error)errors.push(`${table}: ${error.message}`)
    }))
    if(errors.length){
      delete linkedProgramResponseSyncRef.current[formId]
      console.warn("Failed to sync linked program responses",errors)
      if(opts.notify)showToast(isUnlinked?"기존 응답의 교육과정 연결 해제에 실패했어요.":"기존 응답의 교육과정 연결에 실패했어요.",false)
      return
    }
    if(opts.notify)showToast(isUnlinked?"기존 응답의 교육과정 연결을 해제했어요.":"기존 응답도 연결된 교육과정으로 업데이트했어요.")
  }
  function resetQrEditorState(nextCfg?:Cfg){
    const savedDetailQr=(nextCfg?.integrations?.qrLinks||[]).find(link=>link.type==="detail"&&link.url)
    setQrCustomUrl(savedDetailQr?.url||"")
    setQrGeneratedUrl("")
    setQrGeneratedMatrix(null)
    setQrGeneratedError("")
  }
  const editorTabKeyFor=(id:string)=>id?`form:${id}`:""
  const draftEditorTabKey=()=>`draft:${Date.now()}-${Math.random().toString(36).slice(2,7)}`
  const editorTabLabel=(tab:EditorTab)=>String(tab.name||tab.cfg?.header?.title||(!tab.id?"새 폼":"이름 없는 폼")).trim()
  const currentEditorTabSnapshot=(tab?:EditorTab):EditorTab=>({
    key:activeEditorTabKey||tab?.key||draftEditorTabKey(),
    id:loadedId,
    name:loadedName||tab?.name||(!loadedId?"새 폼":"이름 없는 폼"),
    slug:savedSlug,
    brand:currentBrand||tab?.brand||canonicalBrand(cfg.brand||"SNIPERFACTORY"),
    cfg:dc(cfg),
    isDraft:!loadedId,
  })
  function rememberActiveEditorTab(){
    if(!activeEditorTabKey)return
    setEditorTabs(prev=>prev.map(tab=>tab.key===activeEditorTabKey?currentEditorTabSnapshot(tab):tab))
  }
  function applyEditorTab(tab:EditorTab,opts:{resetPanel?:boolean}={}){
    rememberActiveEditorTab()
    setActiveEditorTabKey(tab.key)
    setCfg(dc(tab.cfg))
    setLoadedId(tab.id||"")
    setLoadedName(tab.id?editorTabLabel(tab):"")
    setSavedSlug(tab.slug||"")
    setCurrentBrand(canonicalBrand(tab.brand||tab.cfg?.brand||"SNIPERFACTORY"))
    resetQrEditorState(tab.cfg)
    if(opts.resetPanel){setSec("header");setPvTab("form")}
    setView("builder")
  }
  function upsertEditorTab(tab:EditorTab,opts:{resetPanel?:boolean}={}){
    const nextTab={...tab,brand:canonicalBrand(tab.brand||tab.cfg?.brand||"SNIPERFACTORY"),cfg:dc(tab.cfg)}
    setEditorTabs(prev=>{
      const idx=prev.findIndex(existing=>(nextTab.id&&existing.id===nextTab.id)||existing.key===nextTab.key)
      if(idx<0)return[...prev,nextTab]
      const next=[...prev]
      next[idx]={...next[idx],...nextTab}
      return next
    })
    applyEditorTab(nextTab,opts)
  }
  function activateEditorTab(key:string){
    const tab=editorTabs.find(item=>item.key===key)
    if(tab)applyEditorTab(tab)
  }
  function closeEditorTab(key:string){
    const tab=editorTabs.find(item=>item.key===key)
    if(!tab)return
    if(!tab.id&&!confirm("저장하지 않은 새 폼 탭을 닫을까요?"))return
    const idx=editorTabs.findIndex(item=>item.key===key)
    const next=editorTabs.filter(item=>item.key!==key)
    setEditorTabs(next)
    if(activeEditorTabKey!==key)return
    const fallback=next[Math.min(idx,next.length-1)]||next[idx-1]
    if(view==="builder"&&fallback)applyEditorTab(fallback)
    else if(view==="builder"){
      setActiveEditorTabKey("")
      setLoadedId("")
      setLoadedName("")
      setSavedSlug("")
      setView("dashboard")
    }else setActiveEditorTabKey(fallback?.key||"")
  }
  React.useEffect(()=>{
    if(!activeEditorTabKey||view!=="builder")return
    setEditorTabs(prev=>{
      let touched=false
      const next=prev.map(tab=>{
        if(tab.key!==activeEditorTabKey)return tab
        touched=true
        return currentEditorTabSnapshot(tab)
      })
      return touched?next:prev
    })
  },[activeEditorTabKey,view,cfg,loadedId,loadedName,savedSlug,currentBrand])

  function renderActionLoading(){
    if(!actionLoading)return null
    return <div style={{position:"absolute" as const,inset:0,zIndex:120000,background:adminDark?"rgba(15,17,23,0.62)":"rgba(247,248,250,0.72)",backdropFilter:"blur(3px)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"auto"}}>
      <div style={{minWidth:230,padding:"22px 24px",borderRadius:A.r2,background:A.card,border:`1px solid ${A.border}`,boxShadow:A.shadow,display:"flex",flexDirection:"column" as const,alignItems:"center",gap:12}}>
        <div style={{width:34,height:34,borderRadius:"50%",border:`3px solid ${A.border}`,borderTopColor:A.blue,animation:"actionSpin .8s linear infinite"}}/>
        <div style={{fontSize:14,fontWeight:600,color:A.t1}}>{actionLoading}</div>
        <div style={{fontSize:12.5,color:A.t3}}>잠시만 기다려주세요.</div>
      </div>
    </div>
  }
  function renderUpdateRefreshPrompt(){
    if(!appUpdateAvailable)return null
    return <div style={{position:"absolute" as const,right:24,bottom:24,zIndex:110000,padding:"12px 14px",borderRadius:A.r2,background:A.card,border:`1px solid ${A.blue}44`,boxShadow:A.shadow,display:"flex",alignItems:"center",gap:12,maxWidth:360}}>
      <div style={{width:32,height:32,borderRadius:A.r,background:A.blue2,color:A.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M8 2v4l2-2M8 6 6 4M3.5 9.5a4.5 4.5 0 0 0 8.2 2.6M12.5 6.5a4.5 4.5 0 0 0-8.2-2.6" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div style={{minWidth:0,flex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:A.t1,marginBottom:3}}>새로운 기능이 업데이트되었어요.</div>
        <div style={{fontSize:12,color:A.t3,lineHeight:1.45}}>새로고침하면 최신 화면으로 사용할 수 있어요.</div>
      </div>
      <button onClick={()=>window.location.reload()} style={{height:34,padding:"0 12px",borderRadius:A.r,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:"pointer",flexShrink:0}}>새로고침</button>
    </div>
  }

  function normalizeFormSummary(row:any){
    const brand=canonicalBrand(row.config_brand||row.config?.brand||row.brand||"")
    const title=row.header_title||row.config?.header?.title||""
    const programId=row.program_id||row.config?.header?.programId||""
    const recruitmentPeriodMode=row.recruitment_period_mode||row.config?.header?.recruitmentPeriodMode||""
    const formType=row.form_type||row.config?.formType||""
    const dashboard=row.dashboard_meta||row.config?.dashboard||{}
    return {
      ...row,
      brand,
      config:{brand,formType,dashboard,header:{title,programId,recruitmentPeriodMode}},
      __summary:true,
    }
  }
  async function fetchFormSummaries(sb:any,limit=DASHBOARD_PAGE_SIZE,offset=0){
    const from=offset
    const to=offset+limit-1
    const light:any=await withTimeout(
      sb.from("form_configs").select(FORM_SUMMARY_SELECT).order("updated_at",{ascending:false}).range(from,to),
      10000,
      "폼 목록 조회 시간이 초과됐어요."
    )
    if(!light.error)return (light.data||[]).map(normalizeFormSummary)
    const full:any=await withTimeout(
      sb.from("form_configs").select("id,name,slug,updated_at,config,brand").order("updated_at",{ascending:false}).range(from,to),
      10000,
      "폼 목록 전체 조회 시간이 초과됐어요."
    )
    return (full.data||[]).map(normalizeFormSummary)
  }
  async function getFullFormRow(item:any){
    if(item?.config&&!item.__summary&&(item.config.form||item.config.kdtFields))return {config:item.config,slug:item.slug,name:item.name,brand:item.brand||item.config?.brand}
    if(!supa||!item?.id)throw new Error("폼 정보를 불러올 수 없어요.")
    const cached=fullFormCache.current[item.id]
    if(cached&&(!item.updated_at||cached.updatedAt===item.updated_at))return cached.data
    if(fullFormRequests.current[item.id])return fullFormRequests.current[item.id]
    const request=Promise.resolve(supa.from("form_configs").select("config,slug,name,brand").eq("id",item.id).single())
      .then(({data,error}:any)=>{
        if(error)throw error
        fullFormCache.current[item.id]={updatedAt:item.updated_at,data}
        return data
      })
      .finally(()=>{delete fullFormRequests.current[item.id]})
    fullFormRequests.current[item.id]=request
    return request
  }
  function hasFreshFullFormRow(item:any){
    if(item?.config&&!item.__summary&&(item.config.form||item.config.kdtFields))return true
    if(!item?.id)return false
    const cached=fullFormCache.current[item.id]
    return !!cached&&(!item.updated_at||cached.updatedAt===item.updated_at)
  }
  function drainFullFormPrefetchQueue(){
    if(!supa)return
    while(fullFormPrefetchActive.current<FULL_FORM_PREFETCH_CONCURRENCY&&fullFormPrefetchQueue.current.length){
      const next=fullFormPrefetchQueue.current.shift()
      if(!next?.id||hasFreshFullFormRow(next)||fullFormRequests.current[next.id])continue
      fullFormPrefetchActive.current+=1
      getFullFormRow(next).catch(()=>{}).finally(()=>{
        fullFormPrefetchActive.current=Math.max(0,fullFormPrefetchActive.current-1)
        drainFullFormPrefetchQueue()
      })
    }
  }
  function prefetchFullFormRow(item:any,priority=true){
    if(!supa||!item?.id||hasFreshFullFormRow(item)||fullFormRequests.current[item.id])return
    const queue=fullFormPrefetchQueue.current
    const existing=queue.findIndex((queued:any)=>queued?.id===item.id)
    if(existing>=0)queue.splice(existing,1)
    if(priority)queue.unshift(item)
    else queue.push(item)
    drainFullFormPrefetchQueue()
  }
  function prefetchFullFormRows(items:any[],limit=FULL_FORM_PREFETCH_LIMIT){
    items.slice(0,limit).forEach(item=>prefetchFullFormRow(item,false))
  }
  async function loadProgramCatalog(sb:any=supa,opts:{silent?:boolean}={}){
    if(!sb)return
    const requestId=++programCatalogRequestRef.current
    if(!opts.silent)setProgramCatalogLoading(true)
    setProgramCatalogErr("")
    try{
      const [programRes,categoryRes]:any[]=await Promise.all([
        withTimeout(sb.from("programs").select("*").eq("is_archived",false).order("title"),10000,"프로그램 목록 확인 시간이 초과됐어요."),
        withTimeout(sb.from("categories").select("id,name,brand,slug").order("name"),10000,"카테고리 목록 확인 시간이 초과됐어요."),
      ])
      if(requestId!==programCatalogRequestRef.current)return
      if(programRes.error)throw programRes.error
      if(categoryRes.error)throw categoryRes.error
      setProgs(programRes.data||[])
      setCats(categoryRes.data||[])
    }catch(error){
      if(requestId!==programCatalogRequestRef.current)return
      const message=(error as any)?.message||"교육과정 목록을 불러오지 못했어요."
      setProgramCatalogErr(message)
    }finally{
      if(requestId===programCatalogRequestRef.current)setProgramCatalogLoading(false)
    }
  }

  async function resolveAdminRole(sb:any,userId:string):Promise<AdminRole>{
    const roleRes:any=await withTimeout<any>(
      sb.from("users").select("role").eq("id",userId).single(),
      10000,
      "관리자 권한 확인 시간이 초과됐어요. Supabase 연결 상태를 확인해주세요."
    )
    const userRow=roleRes?.data
    const roleErr=roleRes?.error
    const role=normalizeAdminRole(userRow?.role)
    if(roleErr||!userRow)throw new Error("사용자 정보를 확인할 수 없어요.")
    if(!canUseAdmin(role))throw new Error("관리자 권한이 없어요. admin 또는 master 계정으로 로그인해주세요.")
    return role
  }

  // ── Sidebar scroll ────────────────────────────────────────────────────
  const sbRef=React.useRef<HTMLDivElement>(null)
  const myPos=React.useRef(0)
  const [overSb,setOverSb]=React.useState(false)
  React.useEffect(()=>{
    if(!overSb)return
    const id=setInterval(()=>{const el=sbRef.current;if(!el)return;const y=myPos.current,h=el.clientHeight;if(y>h-56)el.scrollTop+=3;else if(y<56&&y>0)el.scrollTop-=3},16)
    return()=>clearInterval(id)
  },[overSb])

  // ── Auto-connect ──────────────────────────────────────────────────────
  React.useEffect(()=>{
    if(!supabaseUrl||!supabaseAnonKey)return
    const sb=getSB(supabaseUrl,supabaseAnonKey);if(!sb)return
    withTimeout(sb.auth.getSession(),8000,"세션 확인 시간이 초과됐어요.").then(async ({data})=>{
      if(!data?.session)return
      try{
        const role=await resolveAdminRole(sb,data.session.user.id)
        setAuthUser(data.session.user);setAuthRole(role);setSbSt("ok");loadDashboard(sb);setView("dashboard")
      }catch(e){
        await withTimeout(sb.auth.signOut(),6000,"로그아웃 처리 시간이 초과됐어요.").catch(()=>{})
        setAuthUser(null);setAuthRole("");setView("login");setSbSt("idle")
      }
    }).catch(()=>{})
    loadProgramCatalog(sb,{silent:true})
  },[supabaseUrl,supabaseAnonKey])

  React.useEffect(()=>{
    if(typeof window==="undefined")return
    let stopped=false
    const checkVersion=async()=>{
      try{
        const res=await fetch("/api/version")
        if(!res.ok)return
        const data=await res.json().catch(()=>null)
        const version=String(data?.version||"")
        if(!version)return
        if(!appVersionRef.current){appVersionRef.current=version;return}
        if(version!==appVersionRef.current&&!stopped)setAppUpdateAvailable(true)
      }catch{}
    }
    checkVersion()
    const id=window.setInterval(checkVersion,60000)
    const onFocus=()=>checkVersion()
    const onVisibility=()=>{if(document.visibilityState==="visible")checkVersion()}
    window.addEventListener("focus",onFocus)
    document.addEventListener("visibilitychange",onVisibility)
    return()=>{
      stopped=true
      window.clearInterval(id)
      window.removeEventListener("focus",onFocus)
      document.removeEventListener("visibilitychange",onVisibility)
    }
  },[])

  React.useEffect(()=>{
    if(!supa||!authUser||view!=="dashboard")return
    const refresh=()=>scheduleDashboardRefresh()
    const channel=supa
      .channel(`form-configs-dashboard-${authUser.id||Date.now()}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"form_configs"},refresh)
      .subscribe()
    const poll=window.setInterval(refresh,30000)
    const onFocus=()=>refresh()
    const onVisibility=()=>{if(document.visibilityState==="visible")refresh()}
    window.addEventListener("focus",onFocus)
    document.addEventListener("visibilitychange",onVisibility)
    return()=>{
      window.clearInterval(poll)
      clearTimeout(dashboardRefreshTimer.current)
      window.removeEventListener("focus",onFocus)
      document.removeEventListener("visibilitychange",onVisibility)
      supa.removeChannel(channel)
    }
  },[supa,authUser,view])

  // ── Auth functions ────────────────────────────────────────────────────
  async function doLogin(){
    if(!supa){setLoginErr("Supabase 연결 정보가 없어요.");return}
    if(!loginEmail.trim()||!loginPw){setLoginErr("이메일과 비밀번호를 입력해주세요.");return}
    setLoginLoading(true);setLoginErr("")
    try{
      const{data,error}=await withTimeout(
        supa.auth.signInWithPassword({email:loginEmail.trim(),password:loginPw}),
        12000,
        "로그인 요청 시간이 초과됐어요. 인터넷 연결 또는 Supabase 설정을 확인해주세요."
      )
      if(error)throw error
      const role=await resolveAdminRole(supa,data.user.id)
      setAuthUser(data.user);setAuthRole(role);setSbSt("ok")
      setView("dashboard")
      loadDashboard(supa)
      loadProgramCatalog(supa,{silent:true})
    } catch(e){
      await withTimeout(supa.auth.signOut(),6000,"로그아웃 처리 시간이 초과됐어요.").catch(()=>{})
      setAuthUser(null);setAuthRole("")
      const err=(e as any);setLoginErr(err.message==="Invalid login credentials"?"이메일 또는 비밀번호가 올바르지 않아요.":err.message||"로그인 실패")
    }
    finally {setLoginLoading(false)}
  }
  async function doLogout(){if(supa)await supa.auth.signOut();setAuthUser(null);setAuthRole("");setView("login");setSbSt("idle");setLoginEmail("");setLoginPw("")}
  React.useEffect(()=>{
    if(!supa||view!=="builder"||cfg.header.programUnlinked)return
    if(progs.length===0&&!programCatalogLoading&&!programCatalogErr)loadProgramCatalog(supa)
  },[view,cfg.header.programUnlinked,progs.length,programCatalogLoading,programCatalogErr])

  async function loadDashboard(sb:any,opts:{silent?:boolean}={}){
    const silent=!!opts.silent
    if(!silent)setDashLoading(true)
    setDashLoadingMore(false)
    setDashHasMore(true)
    setDashNextOffset(0)
    try{
      const refreshLimit=silent?Math.max(DASHBOARD_PAGE_SIZE,dashNextOffset||0):DASHBOARD_PAGE_SIZE
      const all=await fetchFormSummaries(sb,refreshLimit,0)
      const trashed=all.filter(isFormTrashed)
      const active=all.filter((item:any)=>!isFormTrashed(item))
      setDashNextOffset(all.length)
      setDashHasMore(all.length===refreshLimit)
      setFormTrashItems(trashed)
      setSnList(active.filter((x:any)=>(x.config?.brand||x.brand)==="SNIPERFACTORY"))
      setIoList(active.filter((x:any)=>(x.config?.brand||x.brand)==="INSIDEOUT"))
      setSfacList(active.filter((x:any)=>(x.config?.brand||x.brand)==="SFACSPACE"))
      setSaved(active)
      const warm=()=>{loadDashboardResponseCounts(sb,active);prefetchFullFormRows(active)}
      if(typeof window!=="undefined"&&"requestIdleCallback" in window)(window as any).requestIdleCallback(warm,{timeout:1200})
      else setTimeout(warm,350)
    } catch(e){if(!silent)showToast((e as any)?.message||"폼 목록을 불러오지 못했어요.",false)}
    finally {if(!silent)setDashLoading(false)}
  }

  function scheduleDashboardRefresh(delay=700){
    if(!supa||!authUser||view!=="dashboard")return
    clearTimeout(dashboardRefreshTimer.current)
    dashboardRefreshTimer.current=setTimeout(async()=>{
      if(dashboardRefreshBusy.current)return
      dashboardRefreshBusy.current=true
      try{await loadDashboard(supa,{silent:true})}
      finally{dashboardRefreshBusy.current=false}
    },delay)
  }

  async function loadMoreDashboard(){
    if(!supa||dashLoading||dashLoadingMore||!dashHasMore)return
    const offset=dashNextOffset
    setDashLoadingMore(true)
    try{
      const all=await fetchFormSummaries(supa,DASHBOARD_PAGE_SIZE,offset)
      const trashed=all.filter(isFormTrashed)
      const active=all.filter((item:any)=>!isFormTrashed(item))
      setDashNextOffset(offset+all.length)
      setDashHasMore(all.length===DASHBOARD_PAGE_SIZE)
      setFormTrashItems(prev=>mergeFormRows(prev,trashed))
      setSaved(prev=>mergeFormRows(prev,active))
      setSnList(prev=>mergeFormRows(prev,active.filter((x:any)=>(x.config?.brand||x.brand)==="SNIPERFACTORY")))
      setIoList(prev=>mergeFormRows(prev,active.filter((x:any)=>(x.config?.brand||x.brand)==="INSIDEOUT")))
      setSfacList(prev=>mergeFormRows(prev,active.filter((x:any)=>(x.config?.brand||x.brand)==="SFACSPACE")))
      const warm=()=>{loadDashboardResponseCounts(supa,active,true);prefetchFullFormRows(active,4)}
      if(typeof window!=="undefined"&&"requestIdleCallback" in window)(window as any).requestIdleCallback(warm,{timeout:1200})
      else setTimeout(warm,350)
    }catch(e){showToast((e as any)?.message||"추가 폼 목록을 불러오지 못했어요.",false)}
    finally{setDashLoadingMore(false)}
  }

  function onDashboardTableScroll(e:React.UIEvent<HTMLDivElement>){
    const el=e.currentTarget
    if(el.scrollHeight-el.scrollTop-el.clientHeight<220)loadMoreDashboard()
  }

  async function loadDashboardResponseCounts(sb:any,items:any[],merge=false){
    const ids=items.map((item:any)=>item.id).filter(Boolean)
    if(!ids.length){if(!merge)setDashResponseCounts({});return}
    try{
      const [normal,company]=await Promise.all([
        sb.from("applications").select("form_id").in("form_id",ids).limit(10000),
        sb.from("company_applications").select("form_id").in("form_id",ids).limit(10000),
      ])
      const counts:Record<string,number>={}
      ;[...(normal.data||[]),...(company.data||[])].forEach((row:any)=>{if(row.form_id)counts[row.form_id]=(counts[row.form_id]||0)+1})
      setDashResponseCounts(prev=>merge?{...prev,...counts}:counts)
    }catch{}
  }

  function startNewForm(brand:BrandId){
    setShowBrandModal(false)
    setPendingBrand(brand)
    setShowTemplateModal(true)
  }

  function applyTemplate(tpl:NonNullable<Cfg["formType"]>){
    const brand=pendingBrand||"SNIPERFACTORY"
    const ctaBg=brand==="SNIPERFACTORY"?"#529DFF":brand==="SFACSPACE"?"#073B70":"#EA594D"
    const templates:Record<NonNullable<Cfg["formType"]>,Cfg>={
      alert:DEF,
      kdt:DEF_KDT,
      blank:DEF_BLANK,
      edu_biz:DEF_EDU_BIZ,
      company:DEF_COMPANY,
      recruit:DEF_RECRUIT,
    }
    const base=dc(templates[tpl]||DEF)
    base.brand=brand
    base.cta.bg=ctaBg
    base.dashboard={...(base.dashboard||{}),isPublished:false,publishedAt:"",manualStatus:"draft"}
    if(tpl==="kdt")base.dashboard={...(base.dashboard||{}),formTypeTag:"application"}
    const branded=applyBrandDefaults(base,brand)
    setShowTemplateModal(false);setPendingBrand(null)
    upsertEditorTab({key:draftEditorTabKey(),id:"",name:"새 폼",slug:"",brand,cfg:branded,isDraft:true},{resetPanel:true})
  }

  async function copyForm(item:any){
    if(!supa){showToast("Supabase 연결 필요",false);return}
    setActionLoading("폼을 복사하는 중이에요.")
    try{
      const full=await getFullFormRow(item)
      const cfgCopy=mergeCfg(full.config||{})
      const brand=canonicalBrand(cfgCopy.brand||full.brand||item.brand||currentBrand)
      const copiedDashboard:DashboardMeta={...(cfgCopy.dashboard||{}),isPublished:false,publishedAt:"",manualStatus:"draft"}
      delete (copiedDashboard as any).formTrashedAt
      const brandedCopy=applyBrandDefaults({...cfgCopy,dashboard:copiedDashboard},brand)
      const newName=item.name+" 복사본"
      const newSlug=makeAutoSlug("copy")
      const{error}=await supa.from("form_configs").insert({name:newName,slug:newSlug,config:brandedCopy,brand:dbBrandValue(brand)})
      if(error)throw error
      showToast(`"${newName}" 복사 완료!`)
      loadList();loadDashboard(supa)
    } catch(e){showToast("복사 실패: "+((e as any)?.message||"오류"),false)}
    finally{setActionLoading("")}
  }
  async function openFormForEdit(item:any){
    if(item?.id)markFormRecentlyEdited(String(item.id))
    const alreadyOpen=editorTabs.find(tab=>item?.id&&tab.id===item.id)
    if(alreadyOpen){
      applyEditorTab(alreadyOpen,{resetPanel:false})
      return
    }
    const shouldBlock=!hasFreshFullFormRow(item)
    if(shouldBlock)setActionLoading("폼을 불러오는 중이에요.")
    try{
      const full=await getFullFormRow(item)
      const merged=mergeCfg(full.config||{})
      const brand=canonicalBrand(merged.brand||full.brand||item.brand||"")
      const branded=applyBrandDefaults(merged,brand)
      const id=item.id||""
      upsertEditorTab({key:editorTabKeyFor(id)||draftEditorTabKey(),id,name:full.name||item.name||"",slug:full.slug||item.slug||"",brand,cfg:branded,isDraft:!id},{resetPanel:true})
    } catch(e){showToast("폼 불러오기 실패",false)}
    finally{if(shouldBlock)setActionLoading("")}
  }
  function requestOpenFormForEdit(item:any){
    const passwordHash=item.config?.dashboard?.editPasswordHash||""
    if(passwordHash){
      setEditPasswordPrompt({item,password:"",error:"",checking:false})
      return
    }
    openFormForEdit(item)
  }
  async function verifyEditPassword(){
    if(!editPasswordPrompt?.item)return
    if(!editPasswordPrompt.password){setEditPasswordPrompt(prev=>prev&&({...prev,error:"비밀번호를 입력해주세요."}));return}
    setEditPasswordPrompt(prev=>prev&&({...prev,checking:true,error:""}))
    try{
      const summaryHash=editPasswordPrompt.item.config?.dashboard?.editPasswordHash||""
      const expected=summaryHash||((await getFullFormRow(editPasswordPrompt.item)).config?.dashboard?.editPasswordHash||"")
      if(expected&&await sha256Text(editPasswordPrompt.password)!==expected){
        setEditPasswordPrompt(prev=>prev&&({...prev,checking:false,error:"비밀번호가 맞지 않아요."}))
        return
      }
      setEditPasswordPrompt(null)
      await openFormForEdit(editPasswordPrompt.item)
    }catch(e){
      setEditPasswordPrompt(prev=>prev&&({...prev,checking:false,error:(e as any)?.message||"비밀번호를 확인하지 못했어요."}))
    }
  }
  async function resetEditPasswordFromPrompt(){
    if(!supa||!editPasswordPrompt?.item)return
    if(!canMasterReset(authRole)){
      setEditPasswordPrompt(prev=>prev&&({...prev,error:"비밀번호 원문은 복구할 수 없어요. master 권한 계정으로 비밀번호를 초기화해주세요."}))
      return
    }
    setEditPasswordPrompt(prev=>prev&&({...prev,checking:true,error:""}))
    try{
      const item=editPasswordPrompt.item
      const full=await getFullFormRow(item)
      const next=mergeCfg(full.config||{})
      next.dashboard={...(next.dashboard||{}),editPasswordHash:""}
      const{error}=await supa.from("form_configs").update({config:next,updated_at:new Date().toISOString()}).eq("id",item.id)
      if(error)throw error
      delete fullFormCache.current[item.id]
      if(loadedId===item.id)setCfg(prev=>({...prev,dashboard:{...(prev.dashboard||{}),editPasswordHash:""}}))
      setEditPasswordPrompt(null)
      await loadDashboard(supa)
      showToast("편집 비밀번호를 초기화했어요.")
    }catch(e){
      setEditPasswordPrompt(prev=>prev&&({...prev,checking:false,error:(e as any)?.message||"비밀번호를 초기화하지 못했어요."}))
    }
  }
  async function returnToBuilderFromAnalytics(){
    const expected=cfg.dashboard?.editPasswordHash||""
    if(expected){
      const password=window.prompt("편집 비밀번호를 입력해주세요.")
      if(password===null)return
      if(!password||await sha256Text(password)!==expected){showToast("편집 비밀번호가 맞지 않아요.",false);return}
    }
    setView("builder")
  }
  async function openFormAnalytics(item:any){
    if(activeEditorTabKey&&item?.id!==loadedId){
      rememberActiveEditorTab()
      setActiveEditorTabKey("")
    }
    setActionLoading("응답 데이터를 준비하는 중이에요.")
    try{
      const full=await getFullFormRow(item)
      const merged=mergeCfg(full.config||{})
      const brand=canonicalBrand(merged.brand||full.brand||item.brand||"")
      const branded=applyBrandDefaults(merged,brand)
      setCfg(branded)
      setLoadedId(item.id||"")
      setLoadedName(full.name||item.name||"")
      setSavedSlug(full.slug||item.slug||"")
      setCurrentBrand(brand)
      resetQrEditorState(branded)
      setAnalyticsTab("responses")
      setAnalyticsResponseScope("submitted")
      setQrAnalyticsScope("form")
      setView("analytics")
    }catch(e){showToast("응답 데이터를 불러오지 못했어요.",false)}
    finally{setActionLoading("")}
  }
  function openDashboardSettings(item:any){
    const dashboard=item.config?.dashboard||{}
    const program=progs.find(p=>p.id===item.config?.header?.programId)
    const dbPeriod=recruitmentPeriodOf(program,recruitmentPeriodModeOf(item.config))
    const legacyAlwaysOpen=!dashboard.operationStart&&!dashboard.operationEnd&&dashboard.manualStatus==="active"
    setDashboardSettings({
      item,
      formName:String(item.name||item.config?.header?.title||"").trim(),
      brand:canonicalBrand(item.config?.brand||item.brand||"SNIPERFACTORY"),
      formTypeTag:dashboard.formTypeTag||legacyDashboardFormType(item.config?.formType),
      operationStart:dashboard.operationStart||dbPeriod.start||"",
      operationEnd:dashboard.operationEnd||dbPeriod.end||"",
      operationPeriods:operationPeriodsFromDashboard(dashboard,dbPeriod),
      alwaysOpen:!!dashboard.alwaysOpen||legacyAlwaysOpen,
      manualStatus:dashboard.manualStatus||"",
      currentEditPasswordDraft:"",
      editPasswordDraft:"",
      clearEditPassword:false,
    })
  }
  function openBuilderSettings(){
    if(!loadedId){showToast("폼을 먼저 저장해주세요.",false);return}
    openDashboardSettings({id:loadedId,name:loadedName,slug:savedSlug,brand:currentBrand,config:cfg,__fromBuilder:true})
  }
  async function saveDashboardSettings(){
    if(!supa||!dashboardSettings?.item?.id)return
    setDashboardSettingsSaving(true)
    try{
      const full=dashboardSettings.item.__fromBuilder?dashboardSettings.item:await getFullFormRow(dashboardSettings.item)
      const next=applyBrandDefaults(mergeCfg(full.config||{}),dashboardSettings.brand)
      const nextName=dashboardSettings.formName.trim()
      if(!nextName)throw new Error("폼 제목을 입력해주세요.")
      const periodError=dashboardSettings.alwaysOpen?"":operationPeriodsError(dashboardSettings.operationPeriods,false)
      if(periodError)throw new Error(periodError)
      const nextDashboard=dashboardWithOperationPeriods(next.dashboard,dashboardSettings.operationPeriods)
      const previousEditPasswordHash=next.dashboard?.editPasswordHash||""
      let editPasswordHash=previousEditPasswordHash
      const changingEditPassword=!!dashboardSettings.editPasswordDraft||dashboardSettings.clearEditPassword
      if(changingEditPassword&&previousEditPasswordHash&&!canMasterReset(authRole)){
        if(!dashboardSettings.currentEditPasswordDraft)throw new Error("현재 편집 비밀번호를 입력해주세요.")
        if(await sha256Text(dashboardSettings.currentEditPasswordDraft)!==previousEditPasswordHash)throw new Error("현재 편집 비밀번호가 맞지 않아요.")
      }
      if(dashboardSettings.clearEditPassword)editPasswordHash=""
      else if(dashboardSettings.editPasswordDraft){
        if(dashboardSettings.editPasswordDraft.length<4)throw new Error("편집 비밀번호는 4자 이상으로 입력해주세요.")
        editPasswordHash=await sha256Text(dashboardSettings.editPasswordDraft)
      }
      next.dashboard={
        ...nextDashboard,
        formTypeTag:dashboardSettings.formTypeTag,
        alwaysOpen:dashboardSettings.alwaysOpen,
        manualStatus:"",
        editPasswordHash,
      }
      const updatedAt=new Date().toISOString()
      const {error}=await supa.from("form_configs").update({name:nextName,config:next,brand:dbBrandValue(dashboardSettings.brand),updated_at:updatedAt}).eq("id",dashboardSettings.item.id)
      if(error)throw error
      await syncLinkedProgramResponses(dashboardSettings.item.id,next)
      delete fullFormCache.current[dashboardSettings.item.id]
      if(dashboardSettings.item.__fromBuilder){
        setCfg(next)
        setLoadedName(nextName)
        setCurrentBrand(dashboardSettings.brand)
      }
      setEditorTabs(prev=>prev.map(tab=>tab.id===dashboardSettings.item.id?{...tab,name:nextName,brand:dashboardSettings.brand,cfg:tab.key===activeEditorTabKey?next:{...tab.cfg,dashboard:next.dashboard,brand:dashboardSettings.brand}}:tab))
      setDashboardSettings(null)
      await loadDashboard(supa)
      showToast("폼 설정을 저장했어요.")
    }catch(e){showToast("폼 설정 저장 실패: "+((e as any)?.message||"오류"),false)}
    finally{setDashboardSettingsSaving(false)}
  }

  // ── Cfg updaters ─────────────────────────────────────────────────────
  function uh<K extends keyof Cfg["header"]>(k:K,v:Cfg["header"][K]){setCfg(p=>({...p,header:{...p.header,[k]:v}}))}
  function setEducationSchedules(schedules:EducationSchedule[]){setCfg(p=>({...p,header:headerWithEducationSchedules(p.header,schedules)}))}
  function uf<K extends keyof Cfg["form"]>(k:K,v:Cfg["form"][K]){setCfg(p=>({...p,form:{...p.form,[k]:v}}))}
  function setOperationPeriods(periods:OperationPeriod[]){setCfg(p=>({...p,dashboard:dashboardWithOperationPeriods(p.dashboard,periods)}))}
  function unlinkedOperationPeriodError(){
    if(!cfg.header.programUnlinked)return""
    if(cfg.dashboard?.alwaysOpen)return""
    const periods=operationPeriodsFromDashboard(cfg.dashboard)
    if(!validOperationPeriods(periods).length)return"교육과정 연동을 하지 않는 폼은 폼 운영 기간을 설정해주세요."
    const error=operationPeriodsError(periods,true)
    if(error)return error
    return""
  }
  function mergeRecruitmentPeriodIntoConfig(source:Cfg){
    if(source.header.programUnlinked||!source.header.programId)return source
    const program=progs.find(p=>p.id===source.header.programId)
    const period=recruitmentPeriodOf(program,recruitmentPeriodModeOf(source))
    if(!period.start&&!period.end)return source
    return {
      ...source,
      dashboard:{
        ...(source.dashboard||{}),
        operationPeriods:period.start||period.end?[makeOperationPeriod("range",{id:"linked_program_period",label:recruitmentPeriodLabel(recruitmentPeriodModeOf(source)),start:period.start||"",end:period.end||""})]:source.dashboard?.operationPeriods,
        operationStart:period.start||"",
        operationEnd:period.end||"",
      },
    }
  }
  function applyLinkedProgram(program:Prog){
    const mode=recruitmentPeriodModeOf(cfg)
    const period=recruitmentPeriodOf(program,mode)
    const nextCfg={
      ...cfg,
      header:{...cfg.header,programId:program.id,programUnlinked:false,recruitmentPeriodMode:mode,title:program.title||cfg.header.title},
      dashboard:dashboardWithOperationPeriods({...(cfg.dashboard||{}),operationStart:period.start||"",operationEnd:period.end||""},period.start||period.end?[makeOperationPeriod("range",{id:"linked_program_period",label:recruitmentPeriodLabel(mode),start:period.start||"",end:period.end||""})]:[]),
    }
    setCfg(nextCfg)
  }
  function setRecruitmentPeriodMode(mode:RecruitmentPeriodMode){
    const program=progs.find(p=>p.id===cfg.header.programId)
    if(!program){
      setCfg(p=>({...p,header:{...p.header,recruitmentPeriodMode:mode}}))
      return
    }
    const period=recruitmentPeriodOf(program,mode)
    setCfg(p=>({
      ...p,
      header:{...p.header,recruitmentPeriodMode:mode},
      dashboard:dashboardWithOperationPeriods({...(p.dashboard||{}),operationStart:period.start||"",operationEnd:period.end||""},period.start||period.end?[makeOperationPeriod("range",{id:"linked_program_period",label:recruitmentPeriodLabel(mode),start:period.start||"",end:period.end||""})]:[]),
    }))
  }
  function uad<K extends keyof FormAdConfig>(k:K,v:FormAdConfig[K]){setCfg(p=>({...p,ad:{...DEFAULT_FORM_AD,...(p.ad||{}),[k]:v}}))}
  function updateField(idx:number,patch:Partial<FormField>){setCfg(p=>({...p,form:{...p.form,fields:p.form.fields.map((f,i)=>i===idx?{...f,...patch}:f)}}))}
  function addField(type:FieldType="text"){
    const fieldDefs:Record<string,{id:string;label:string;placeholder:string;helper?:string;required:boolean}> = {
      name:     {id:"name",     label:"이름을 입력해주세요.",                    placeholder:"예) 홍길동",             required:true},
      phone:    {id:"phone",    label:"연락 가능한 휴대폰 번호를 입력해 주세요.", placeholder:"예) 010-1234-5678",       required:true},
      email:    {id:"email",    label:"이메일 주소를 입력해주세요.",              placeholder:"예) example@email.com",   required:true},
      referral: {id:"referral", label:"프로그램을 어디에서 알게 되셨나요?",       placeholder:"선택해주세요.",           required:false},
      text:     {id:"",         label:"단답형 질문",                             placeholder:"예) 답변을 입력해주세요.", required:false},
      textarea: {id:"",         label:"장문형 질문",                             placeholder:"예) 자세한 답변을 작성해주세요.", required:false},
      date:     {id:"",         label:"날짜를 선택해주세요.",                    placeholder:"",                         required:false},
      time:     {id:"",         label:"시간을 선택해주세요.",                    placeholder:"",                         required:false},
      file:     {id:"",         label:"파일을 첨부해주세요.",                    placeholder:"파일 업로드",              required:false},
    }
    const preset = fieldDefs[type]
    const id = preset?.id ? preset.id : "f_"+Date.now()
    const defaultLabel = type==="info" ? "안내 텍스트" : preset ? preset.label : "새 질문"
    const defaultPh = type==="info" ? "" : preset ? preset.placeholder : "입력해주세요."
    const extra:any = preset ? {required:preset.required} : {}
    if(preset?.helper)extra.helper=preset.helper
    if(type==="referral"){extra.opts=DEFOPTS;extra.etcPh="기타 경로를 입력해주세요."}
    if(type==="dropdown"||type==="button_select"||type==="checkbox"){
      extra.opts=[
        {label:"예시 답변 1",value:"예시 답변 1",isEtc:false},
        {label:"예시 답변 2",value:"예시 답변 2",isEtc:false},
      ]
      extra.placeholder="선택해주세요."
      if(type==="button_select"||type==="checkbox")extra.cols=2
    }
    const finalType = type==="referral" ? "dropdown" : type
    setCfg(p=>({...p,form:{...p.form,fields:[...p.form.fields,{id,type:finalType,label:defaultLabel,placeholder:defaultPh,page:pvPage,...extra}]}}))
  }
  function addPage(){setCfg(p=>({...p,form:{...p.form,pages:(p.form.pages||1)+1}}))}
  function removePage(pageNum:number){
    const curPages=isKdt?3:(cfg.form.pages||1)
    if(curPages<=1)return
    setCfg(p=>{
      if(isKdt){
        const newKdt=(p.kdtFields||[]).map((f:any)=>{
          const fp=f.page||1
          if(fp===pageNum)return{...f,page:Math.max(1,pageNum-1)}
          if(fp>pageNum)return{...f,page:fp-1}
          return f
        })
        return{...p,kdtFields:newKdt}
      }
      const newFields=p.form.fields.map(f=>{
        const fp=f.page||1
        if(fp===pageNum)return{...f,page:Math.max(1,pageNum-1)}
        if(fp>pageNum)return{...f,page:fp-1}
        return f
      })
      return{...p,form:{...p.form,pages:Math.max(1,(p.form.pages||1)-1),fields:newFields}}
    })
    if(pvPage>=pageNum)setPvPage(Math.max(1,pageNum-1))
  }
  function moveFieldToPage(fieldIdx:number,targetPage:number){
    setCfg(p=>({...p,form:{...p.form,fields:p.form.fields.map((f,i)=>i===fieldIdx?{...f,page:targetPage}:f)}}))
  }
  function duplicateField(idx:number){
    const f=cfg.form.fields[idx]
    if(!f)return
    const newF={...JSON.parse(JSON.stringify(f)),id:"f_"+Date.now()}
    setCfg(p=>{const arr=[...p.form.fields];arr.splice(idx+1,0,newF);return{...p,form:{...p.form,fields:arr}}})
  }
  function removeField(idx:number){
    const f=cfg.form.fields[idx]
    if(!f)return
    setDeletedField({field:f,idx})
    setCfg(p=>({...p,form:{...p.form,fields:p.form.fields.filter((_,i)=>i!==idx)}}))
    setEditIdx(null)
    showToast("항목이 삭제되었습니다",true,()=>{
      setCfg(p=>{const arr=[...p.form.fields];arr.splice(idx,0,f);return{...p,form:{...p.form,fields:arr}}})
      setDeletedField(null)
      clearTimeout(toastRef.current)
      setToast(null)
    })
  }
  function moveField(from:number,to:number){if(from===to)return;setCfg(p=>{const f=[...p.form.fields];const[m]=f.splice(from,1);f.splice(to,0,m);return{...p,form:{...p.form,fields:f}}})}
  // KDT field helpers
  function updateKdtField(idx:number,patch:Partial<KdtField>){setCfg(p=>{const kf=[...(p.kdtFields||[])];kf[idx]={...kf[idx],...patch};return{...p,kdtFields:kf}})}
  function moveKdtField(from:number,to:number){if(from===to)return;setCfg(p=>{const kf=[...(p.kdtFields||[])];const[m]=kf.splice(from,1);kf.splice(to,0,m);return{...p,kdtFields:kf}})}
  // generic helpers — detect form type
  const isKdt=cfg.formType==="kdt"&&!!cfg.kdtFields
  const formPages=isKdt?Math.max(3,...(cfg.kdtFields||[]).map((f:any)=>f.page||1)):(cfg.form.pages||1)
  const isMultiPage=formPages>1
  function getActiveFields():FormField[]|KdtField[]{if(isKdt)return (cfg.kdtFields||[]).filter(f=>f.page===pvPage);const pages=cfg.form.pages||1;if(pages>1)return (cfg.form.fields||[]).filter(f=>(f.page||1)===pvPage);return cfg.form.fields||[]}
  function patchActiveField(idx:number,patch:any){if(isKdt){const kf=cfg.kdtFields||[];const globalIdx=kf.indexOf((cfg.kdtFields||[]).filter(f=>f.page===pvPage)[idx]);updateKdtField(globalIdx,patch)}else if(isMultiPage){const pageF=cfg.form.fields.filter(f=>(f.page||1)===pvPage);const globalIdx=cfg.form.fields.indexOf(pageF[idx]);updateField(globalIdx,patch)}else{updateField(idx,patch)}}
  function getPageLabel(p:number):string{
    if(isKdt){const kdtDef=["기본 정보","상세 정보","자격 요건 및 동의"];return(cfg.form.pageLabels||[])[p-1]||kdtDef[p-1]||`섹션${p}`}
    return(cfg.form.pageLabels||[])[p-1]||`섹션${p}`
  }
  function previewFieldOptions(field:any):Opt[]{
    const raw=(field.opts&&field.opts.length)?field.opts:(field.options||[])
    return raw.map((opt:any)=>{
      const label=String(opt?.label??opt?.value??opt)
      const value=String(opt?.value??opt?.label??opt)
      const key=value.trim().toLowerCase()
      return {...(typeof opt==="object"?opt:{}),label,value,isEtc:!!opt?.isEtc||label.trim()==="기타"||value.trim()==="기타"||key==="etc"||key==="other"}
    })
  }
  function previewBranchTarget(){
    if(isKdt)return 0
    const fields=(cfg.form.fields||[]).filter((field:any)=>(field.page||1)===pvPage)
    for(const field of fields){
      if(field.type!=="button_select"&&field.type!=="dropdown")continue
      const selectedValue=pvFieldVals[field.id]||""
      if(!selectedValue)continue
      const selectedOpt=previewFieldOptions(field).find(opt=>opt.value===selectedValue)
      const target=Number(selectedOpt?.nextPage)
      if(Number.isFinite(target))return target
    }
    return 0
  }
  function pushPreviewPage(nextPage:number){
    const target=Math.min(formPages,Math.max(1,nextPage))
    if(target===pvPage)return
    setPvPageHistory(prev=>[...prev,pvPage])
    setPvPage(target)
  }
  function goPreviewPrevious(){
    const last=pvPageHistory[pvPageHistory.length-1]
    if(Number.isFinite(last)&&last>=1&&last<=formPages){
      setPvPageHistory(prev=>prev.slice(0,-1))
      setPvPage(last)
      return
    }
    setPvPage(p=>Math.max(1,p-1))
  }
  function goPreviewNext(){
    const branchTarget=previewBranchTarget()
    if(branchTarget===9999){setPvShowModal(true);return}
    const target=branchTarget>=1&&branchTarget<=formPages&&branchTarget!==pvPage?branchTarget:pvPage+1
    pushPreviewPage(target)
  }
  function pageLabelFromConfig(source:Cfg,p:number):string{
    const kdt=source.formType==="kdt"&&!!source.kdtFields
    if(kdt){const kdtDef=["기본 정보","상세 정보","자격 요건 및 동의"];return(source.form.pageLabels||[])[p-1]||kdtDef[p-1]||`섹션${p}`}
    return(source.form.pageLabels||[])[p-1]||`섹션${p}`
  }
  function setPageLabel(p:number,label:string){
    setCfg(prev=>{const arr=[...(prev.form.pageLabels||Array.from({length:formPages},(_,i)=>""))];arr[p-1]=label;return{...prev,form:{...prev.form,pageLabels:arr}}})
  }
  function moveSection(from:number,to:number){
    const pageCount=formPages
    if(from===to||from<0||to<0||from>=pageCount||to>=pageCount)return
    const order=Array.from({length:pageCount},(_,i)=>i+1)
    const [movedPage]=order.splice(from,1)
    order.splice(to,0,movedPage)
    const pageMap=new Map<number,number>()
    order.forEach((oldPage,newIdx)=>pageMap.set(oldPage,newIdx+1))
    const nextActivePage=pageMap.get(pvPage)||pvPage
    setCfg(prev=>{
      const sourceIsKdt=prev.formType==="kdt"&&!!prev.kdtFields
      const labels=Array.from({length:pageCount},(_,i)=>pageLabelFromConfig(prev,i+1))
      const [movedLabel]=labels.splice(from,1)
      labels.splice(to,0,movedLabel)
      const reorderPageItems=<T extends {page?:number}>(items:T[])=>{
        const grouped=new Map<number,T[]>()
        const outside:T[]=[]
        items.forEach(item=>{
          const oldPage=Number(item.page||1)
          const nextPage=pageMap.get(oldPage)
          if(!nextPage){outside.push(item);return}
          const nextItem={...item,page:nextPage}
          grouped.set(oldPage,[...(grouped.get(oldPage)||[]),nextItem])
        })
        return [...order.flatMap(oldPage=>grouped.get(oldPage)||[]),...outside]
      }
      const nextForm={...prev.form,pages:Math.max(prev.form.pages||1,pageCount),pageLabels:labels}
      if(sourceIsKdt)return{...prev,form:nextForm,kdtFields:reorderPageItems(prev.kdtFields||[])}
      return{...prev,form:{...nextForm,fields:reorderPageItems(prev.form.fields||[])}}
    })
    setPvPage(nextActivePage)
    setEditIdx(null)
    setSelectedFieldId(null)
    setReplaceId(null)
  }
  function moveActiveField(from:number,to:number){if(isKdt){const kf=cfg.kdtFields||[];const pageFields=kf.filter(f=>f.page===pvPage);const gFrom=kf.indexOf(pageFields[from]);const gTo=kf.indexOf(pageFields[to]);moveKdtField(gFrom,gTo)}else if(isMultiPage){const pageF=cfg.form.fields.filter(f=>(f.page||1)===pvPage);const gFrom=cfg.form.fields.indexOf(pageF[from]);const gTo=cfg.form.fields.indexOf(pageF[to]);moveField(gFrom,gTo)}else{moveField(from,to)}}
  function reorderActiveFieldOption(fieldIdx:number,from:number,to:number){
    const field=(getActiveFields() as any[])[fieldIdx]
    if(!field)return
    const raw=(field.opts&&field.opts.length)?field.opts:(field.options||[]).map((o:any)=>({label:String(o),value:String(o),isEtc:String(o)==="기타"}))
    if(from===to||from<0||to<0||from>=raw.length||to>=raw.length)return
    const next=[...raw]
    const [moved]=next.splice(from,1)
    next.splice(to,0,moved)
    patchActiveField(fieldIdx,{opts:next})
  }
  function uc<K extends keyof Cfg["consents"][0]>(idx:number,k:K,v:Cfg["consents"][0][K]){setCfg(p=>({...p,consents:p.consents.map((c,i)=>i===idx?{...c,[k]:v}:c)}))}
  function patchConsent(idx:number,patch:Partial<Cfg["consents"][0]>){setCfg(p=>({...p,consents:p.consents.map((c,i)=>i===idx?{...c,...patch}:c)}))}
  function addConsent(){setCfg(p=>({...p,consents:[...p.consents,{enabled:true,required:false,title:"추가 동의 항목",body:"",checkLabel:"동의합니다.",policyUrl:"",policyMode:"brand"}]}))}
  function removeConsent(idx:number){setCfg(p=>({...p,consents:p.consents.filter((_,i)=>i!==idx)}))}
  function ut<K extends keyof Cfg["cta"]>(k:K,v:Cfg["cta"][K]){setCfg(p=>({...p,cta:{...p.cta,[k]:v}}))}
  function um<K extends keyof Cfg["modal"]>(k:K,v:Cfg["modal"][K]){setCfg(p=>({...p,modal:{...p.modal,[k]:v}}))}
  function umShare(k:ModalShareKey,v:boolean){setCfg(p=>({...p,modal:{...p.modal,shareButtons:{...DEFAULT_MODAL_SHARE_BUTTONS,...(p.modal.shareButtons||{}),[k]:v}}}))}
  function us<K extends keyof Cfg["styles"]>(k:K,v:Cfg["styles"][K]){setCfg(p=>({...p,styles:{...p.styles,[k]:v}}))}
  function ua<K extends keyof Cfg["auth"]>(k:K,v:Cfg["auth"][K]){setCfg(p=>({...p,auth:{...p.auth,[k]:v}}))}
  function ug<K extends keyof NonNullable<NonNullable<Cfg["integrations"]>["googleSheets"]>>(k:K,v:NonNullable<NonNullable<Cfg["integrations"]>["googleSheets"]>[K]){
    setCfg(p=>({...p,integrations:{...(p.integrations||{}),googleSheets:{...DEFAULT_GOOGLE_SHEETS,...(p.integrations?.googleSheets||{}),[k]:v}}}))
  }

  // ── Supabase ops ──────────────────────────────────────────────────────
  async function loadList(){
    if(!supa)return
    const list=await fetchFormSummaries(supa,20)
    setSaved(list.filter((item:any)=>!isFormTrashed(item)))
  }
  async function confirmEditPasswordForDelete(passwordHash:string,name:string){
    if(!passwordHash)return true
    const password=window.prompt(`"${name}"을 삭제하려면 편집 비밀번호를 입력해주세요.`)
    if(password===null)return false
    if(!password||await sha256Text(password)!==passwordHash){
      showToast("편집 비밀번호가 맞지 않아 삭제할 수 없어요.",false)
      return false
    }
    return true
  }
  async function delCfg(id:string,name:string){
    if(!supa||!confirm(`"${name}"을 폼 휴지통으로 이동할까요?`))return
    try{
      const full=await getFullFormRow({id,name})
      const next=mergeCfg(full.config||{})
      if(!await confirmEditPasswordForDelete(next.dashboard?.editPasswordHash||"",name))return
      next.dashboard={...(next.dashboard||{}),formTrashedAt:new Date().toISOString()}
      const{data,error}=await supa.from("form_configs").update({config:next,updated_at:new Date().toISOString()}).eq("id",id).select("id")
      if(error)throw error
      if(!data||data.length===0){showToast("휴지통으로 이동할 폼을 찾지 못했거나 권한이 없어요.",false);return}
      delete fullFormCache.current[id]
      setEditorTabs(prev=>prev.filter(tab=>tab.id!==id))
      if(loadedId===id){setLoadedId("");setLoadedName("");setSavedSlug("");setActiveEditorTabKey("");setView("dashboard")}
      showToast(`"${name}"을 폼 휴지통으로 이동했어요.`)
      loadList();loadDashboard(supa)
    }catch(error){
      showToast("휴지통 이동 실패: "+((error as any)?.message||"오류"),false)
    }
  }
  async function restoreFormFromTrash(item:any){
    if(!supa||!item?.id)return
    setFormTrashBusy(item.id)
    try{
      const full=await getFullFormRow(item)
      const next=mergeCfg(full.config||{})
      const dashboard={...(next.dashboard||{})}
      delete (dashboard as any).formTrashedAt
      next.dashboard=dashboard
      const{error}=await supa.from("form_configs").update({config:next,updated_at:new Date().toISOString()}).eq("id",item.id)
      if(error)throw error
      const restoredAnalyticsScopes=await restoreActiveAnalyticsTrashForForm(item.id,full.slug||item.slug||"")
      delete fullFormCache.current[item.id]
      showToast(restoredAnalyticsScopes>0
        ? `"${item.name||full.name||"폼"}"을 복구했고 응답/QR 데이터도 함께 복구했어요.`
        : `"${item.name||full.name||"폼"}"을 복구했어요.`
      )
      loadList();loadDashboard(supa)
    }catch(error){
      showToast("폼 복구 실패: "+((error as any)?.message||"오류"),false)
    }finally{
      setFormTrashBusy("")
    }
  }
  async function purgeFormFromTrash(item:any){
    if(!supa||!item?.id)return
    const name=item.name||"폼"
    if(!confirm(`"${name}"을 영구 삭제할까요? 제출 응답과 QR/분석 기록까지 모두 삭제되며 복구할 수 없어요.`))return
    setFormTrashBusy(item.id)
    try{
      const id=item.id
      const deleteFrom=async(table:string)=>{
        const {error}=await supa.from(table).delete().eq("form_id",id)
        if(error)throw error
      }
      await deleteFrom("applications")
      await deleteFrom("company_applications")
      await deleteFrom("form_response_events")
      const {error}=await supa.from("form_configs").delete().eq("id",id)
      if(error)throw error
      delete fullFormCache.current[id]
      setEditorTabs(prev=>prev.filter(tab=>tab.id!==id))
      if(loadedId===id){setLoadedId("");setLoadedName("");setSavedSlug("");setActiveEditorTabKey("");setView("dashboard")}
      setFormTrashItems(prev=>prev.filter(form=>form.id!==id))
      showToast(`"${name}"을 영구 삭제했어요.`)
      loadList();loadDashboard(supa)
    }catch(error){
      showToast("폼 영구 삭제 실패: "+((error as any)?.message||"오류"),false)
    }finally{
      setFormTrashBusy("")
    }
  }
  async function purgeAllFormsFromTrash(){
    if(!supa)return
    const targets=formTrashItems.filter((item:any)=>item?.id)
    if(!targets.length)return
    if(!confirm(`휴지통의 폼 ${targets.length}개를 모두 영구 삭제할까요? 제출 응답과 QR/분석 기록까지 모두 삭제되며 복구할 수 없어요.`))return
    setFormTrashBusy("__all__")
    const failed:string[]=[]
    try{
      for(const item of targets){
        const id=item.id
        try{
          const deleteFrom=async(table:string)=>{
            const {error}=await supa.from(table).delete().eq("form_id",id)
            if(error)throw error
          }
          await deleteFrom("applications")
          await deleteFrom("company_applications")
          await deleteFrom("form_response_events")
          const {error}=await supa.from("form_configs").delete().eq("id",id)
          if(error)throw error
          delete fullFormCache.current[id]
          setEditorTabs(prev=>prev.filter(tab=>tab.id!==id))
          if(loadedId===id){setLoadedId("");setLoadedName("");setSavedSlug("");setActiveEditorTabKey("");setView("dashboard")}
          setFormTrashItems(prev=>prev.filter(form=>form.id!==id))
        }catch(error){
          failed.push(item.name||"이름 없는 폼")
        }
      }
      if(failed.length)showToast(`${targets.length-failed.length}개를 영구 삭제했고 ${failed.length}개는 실패했어요.`,false)
      else showToast(`휴지통의 폼 ${targets.length}개를 영구 삭제했어요.`)
      loadList();loadDashboard(supa)
    }finally{
      setFormTrashBusy("")
    }
  }
  async function renameCfg(id:string,newName:string){
    if(!supa||!newName.trim())return
    const{error}=await supa.from("form_configs").update({name:newName.trim()}).eq("id",id)
    if(error){showToast("이름 변경 실패",false);return}
    if(loadedId===id)setLoadedName(newName.trim())
    setEditorTabs(prev=>prev.map(tab=>tab.id===id?{...tab,name:newName.trim()}:tab))
    showToast(`이름이 "${newName.trim()}"으로 변경됐어요!`)
    loadList();loadDashboard(supa)
    setRenameModal(null)
  }
  const normalizeSlug=(v:string)=>v.trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/-+/g,"-").replace(/^-+|-+$/g,"")
  const hasInvalidSlugChars=(v:string)=>/[^a-zA-Z0-9-]/.test(v.trim())
  async function updateFormSlug(){
    const raw=slugDraft.trim()
    if(hasInvalidSlugChars(raw)){
      showToast("슬러그는 한글, 공백 없이 영문, 숫자, 하이픈(-)만 사용할 수 있어요.",false)
      return
    }
    const next=normalizeSlug(raw)
    if(!next){showToast("슬러그를 입력해주세요.",false);return}
    if(!supa){showToast("Supabase 연결 필요",false);return}
    if(!loadedId){
      setSaveSlug(next);setSlugDraft(next);showToast("처음 저장할 때 이 슬러그가 적용돼요.");return
    }
    const{data:dup,error:dupErr}=await supa.from("form_configs").select("id,name,slug").eq("slug",next).limit(1)
    if(dupErr){showToast("슬러그 중복 확인 실패: "+(dupErr.message||"오류"),false);return}
    const owner=(dup||[]).find((row:any)=>row.id!==loadedId)
    if(owner){
      showToast(`"${next}"는 이미 "${owner.name||"다른 폼"}"에서 사용 중이에요. 다른 슬러그를 입력해주세요.`,false)
      return
    }
    const{error}=await supa.from("form_configs").update({slug:next,updated_at:new Date().toISOString()}).eq("id",loadedId)
    if(error){
      const msg=error.message||"오류"
      showToast(msg.includes("duplicate key")||msg.includes("form_configs_slug_key")
        ? `"${next}"는 이미 사용 중인 슬러그예요. 다른 슬러그를 입력해주세요.`
        : "슬러그 변경 실패: "+msg,false)
      return
    }
    setSavedSlug(next);setSlugDraft(next);showToast("슬러그가 변경됐어요.")
    loadList();loadDashboard(supa)
  }
  async function saveCfg(){
    if(!supa){setSaveErr("Supabase를 먼저 연결해주세요.");return}
    if(!saveName.trim()){setSaveErr("이름을 입력해주세요.");return}
    const periodError=unlinkedOperationPeriodError()
    if(periodError){setSaveErr(periodError);return}
    setSaving(true);setSaveErr("")
    try{
      const slug=saveSlug.trim()||makeAutoSlug()
      const cfgFinal=applyBrandDefaults({...cfg,brand:currentBrand,dashboard:dashboardWithOperationPeriods({...(cfg.dashboard||{}),isPublished:false,publishedAt:"",manualStatus:"draft" as DashboardManualStatus})},currentBrand)
      const nextName=saveName.trim()
      const{data:ins,error}=await supa.from("form_configs").insert({name:saveName.trim(),slug,config:cfgFinal,brand:dbBrandValue(currentBrand)}).select("id,slug").single()
      if(error)throw error
      const nextId=ins?.id||""
      const nextSlug=ins?.slug||slug
      const nextKey=editorTabKeyFor(nextId)||activeEditorTabKey||draftEditorTabKey()
      setShowSave(false);setSaveName("");setSaveSlug("")
      setSavedSlug(nextSlug);setLoadedId(nextId);setLoadedName(nextName);setActiveEditorTabKey(nextKey)
      setEditorTabs(prev=>{
        const nextTab:EditorTab={key:nextKey,id:nextId,name:nextName,slug:nextSlug,brand:currentBrand,cfg:cfgFinal,isDraft:false}
        const withoutDuplicate=prev.filter(tab=>tab.key!==activeEditorTabKey&&(!nextId||tab.id!==nextId))
        return[...withoutDuplicate,nextTab]
      })
      showToast(`"${nextName}" 저장 완료!`);loadList();loadDashboard(supa)
    } catch(e){
      const err=(e as any);const msg=err.message||"오류"
      setSaveErr("저장 실패: "+msg+(msg.includes("security")||msg.includes("RLS")?" — form_configs 테이블의 RLS를 비활성화해주세요.":""))
    } finally {setSaving(false)}
  }
	  function updateCfg(silent?:boolean){
	    if(!supa||!loadedId)return
	    const periodError=unlinkedOperationPeriodError()
	    if(periodError){
	      if(!silent)showToast(periodError,false)
	      return
	    }
	    setShowUpdateModal(false)
	    if(!silent)showToast(`"${loadedName}" 수정 완료!`)
	    const cfgFinal=applyBrandDefaults({...cfg,brand:currentBrand,dashboard:dashboardWithOperationPeriods(cfg.dashboard)},currentBrand)
	    const updatedAt=new Date().toISOString()
	    fullFormCache.current[loadedId]={updatedAt,data:{config:cfgFinal,slug:savedSlug,name:loadedName,brand:currentBrand}}
	    supa.from("form_configs").update({config:cfgFinal,brand:dbBrandValue(currentBrand),updated_at:updatedAt}).eq("id",loadedId)
		      .then(({error})=>{if(error)showToast("저장 중 오류가 발생했어요",false);else{void syncLinkedProgramResponses(loadedId,cfgFinal);loadList();loadDashboard(supa)}})
		  }
  function onSaveClick(){if(loadedId)setShowUpdateModal(true);else setShowSave(true)}
  function getBrandFormBaseUrl(brand=currentBrand){
    const normalized=canonicalBrand(brand)
    if(normalized==="SNIPERFACTORY"||normalized==="SFACSPACE")return CATCHFORM_DIRECT_FORM_BASE_URL
    return (formBaseUrl||"").replace(/\/+$/,"")
  }
  function buildPublicFormUrl(slug=savedSlug,brand=currentBrand){
    const safeSlug=String(slug||"").trim()
    if(!safeSlug)return""
    const normalized=canonicalBrand(brand)
    if(normalized==="SNIPERFACTORY"||normalized==="SFACSPACE")return `${CATCHFORM_DIRECT_FORM_BASE_URL}/${encodeURIComponent(safeSlug)}`
    const base=getBrandFormBaseUrl(normalized)
    return base?`${base}?slug=${encodeURIComponent(safeSlug)}`:""
  }
  async function publishAndOpenForm(){
    if(!savedSlug||!loadedId){showToast("폼을 먼저 저장해주세요",false);return}
    const target=buildPublicFormUrl()
    if(!target){showToast("브랜드별 배포 페이지 URL을 먼저 설정해주세요",false);return}
    const periodError=unlinkedOperationPeriodError()
    if(periodError){showToast(periodError,false);return}
    const popup=typeof window!=="undefined"?window.open("about:blank","_blank"):null
    if(!supa){
      if(popup)popup.location.href=target
      else window.open(target,"_blank")
      return
    }
    setActionLoading("폼을 공개하는 중이에요.")
    try{
      const now=new Date().toISOString()
      const dashboard=cfg.dashboard||{}
      const nextCfg:Cfg=applyBrandDefaults(mergeRecruitmentPeriodIntoConfig({
        ...cfg,
        brand:currentBrand,
        dashboard:{
          ...dashboardWithOperationPeriods(dashboard),
          isPublished:true,
          publishedAt:dashboard.publishedAt||now,
          manualStatus:!dashboard.manualStatus||dashboard.manualStatus==="draft"?"active":dashboard.manualStatus,
        },
      }),currentBrand)
      const{error}=await supa.from("form_configs").update({config:nextCfg,brand:dbBrandValue(currentBrand),updated_at:now}).eq("id",loadedId)
      if(error)throw error
      await syncLinkedProgramResponses(loadedId,nextCfg)
      setCfg(nextCfg)
      fullFormCache.current[loadedId]={updatedAt:now,data:{config:nextCfg,slug:savedSlug,name:loadedName,brand:currentBrand}}
      loadList();loadDashboard(supa)
      if(popup)popup.location.href=target
      else window.open(target,"_blank")
      showToast("폼을 공개하고 새 창에서 열었어요.")
    }catch(e){
      popup?.close()
      showToast("폼 공개 실패: "+((e as any)?.message||"오류"),false)
    }finally{setActionLoading("")}
  }
  async function setGoogleSheetsSyncStatus(status:"sent"|"error",message:string,patch:Partial<NonNullable<NonNullable<Cfg["integrations"]>["googleSheets"]>>={}){
    const nextCfg=applyBrandDefaults({
      ...cfg,
      brand:currentBrand,
      integrations:{
        ...(cfg.integrations||{}),
        googleSheets:{
          ...DEFAULT_GOOGLE_SHEETS,
          ...(cfg.integrations?.googleSheets||{}),
          ...patch,
          lastSyncStatus:status,
          lastSyncAt:new Date().toISOString(),
          lastSyncMessage:message
        }
      }
    },currentBrand)
    setCfg(nextCfg)
    if(supa&&loadedId){
      await supa.from("form_configs").update({config:nextCfg,brand:dbBrandValue(currentBrand),updated_at:new Date().toISOString()}).eq("id",loadedId)
    }
  }
  async function testGoogleSheetsIntegration(){
    const gs={...DEFAULT_GOOGLE_SHEETS,...(cfg.integrations?.googleSheets||{})}
    const webhookUrl=String(gs.webhookUrl||googleSheetsWebhookUrl||"").trim()
    if(!loadedId){showToast("폼을 먼저 저장한 뒤 연동 테스트를 해주세요.",false);return}
    if(!gs.enabled){showToast("응답 자동 연동을 먼저 켜주세요.",false);return}
    if(!webhookUrl){showToast("Apps Script Web App URL을 입력해주세요.",false);return}
    setActionLoading("구글 시트 연동을 테스트하는 중이에요.")
    try{
      const payload={
        integration:"google_sheets",
        action:"test",
        schema:"analytics_export_v1",
        mode:gs.mode||"existing",
        accountEmail:gs.accountEmail||"",
        sheetUrl:gs.sheetUrl||"",
        sheetName:gs.sheetName||cfg.header?.title||"CatchForm Responses",
        formId:loadedId,
        formSlug:savedSlug||saveSlug||"",
        formTitle:cfg.header?.title||loadedName||"CatchForm",
        submittedAt:new Date().toISOString(),
        columns:["날짜","시간","이름","전화번호","이메일","테스트"],
        row:{
          날짜:new Date().toLocaleDateString("sv-SE"),
          시간:new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:false}),
          이름:"",
          전화번호:"",
          이메일:"",
          테스트:"CatchForm 연동 테스트"
        },
        answers:[{question:"테스트",answer:"CatchForm 연동 테스트",answerKey:"test"}]
      }
      const result:any=await postAppsScriptPayload(webhookUrl,payload,{allowDirectFallback:false})
      const returnedSheetUrl=String(result?.spreadsheetUrl||"").trim()
      if(gs.mode==="new"&&!returnedSheetUrl)throw new Error("새 스프레드시트 URL을 받지 못했어요. Apps Script Web App URL이 최신 코드로 배포되어 있는지 확인해주세요.")
      await setGoogleSheetsSyncStatus(
        "sent",
        returnedSheetUrl
          ? "테스트 전송 완료. 생성/연결된 시트 URL을 저장했어요."
          : "테스트 전송 완료. 시트에 'CatchForm 연동 테스트' 행이 생겼는지 확인해주세요.",
        {
          webhookUrl,
          ...(returnedSheetUrl?{sheetUrl:returnedSheetUrl}:{}),
        }
      )
      showToast("테스트 전송 요청 완료! 시트를 확인해주세요.")
      loadList()
    }catch(e){
      const msg=(e as any)?.message||"테스트 전송 실패"
      await setGoogleSheetsSyncStatus("error",msg)
      showToast("테스트 전송 실패: "+msg,false)
    }finally{setActionLoading("")}
  }
  function googleSheetOpenUrl(gs:any){
    const savedSheetUrl=String(gs.sheetUrl||"").trim()
    if(savedSheetUrl)return savedSheetUrl
    return ""
  }

  function consentConfigAnswerKey(consent:any,index:number){
    const consentType=String(consent?.consentType||"")
    const title=String(consent?.title||"")
    const inferredType=consentTypeFromTitle(title)
    const isPrivacy=consentType==="privacy_consent"||inferredType==="privacy_consent"||title==="개인정보 수집 및 이용동의"
    const isMarketing=consentType==="marketing_consent"||inferredType==="marketing_consent"||title.includes("마케팅")
    return consentType||(isPrivacy?"privacy_consent":isMarketing?"marketing_consent":`consent_${index}`)
  }
  function isConsentAnswerItem(item:any){
    const answerKey=String(item?.answerKey||"")
    const question=String(item?.question||"")
    const knownConsentKeys=new Set(CONSENT_TYPES.flatMap(type=>[type.key,type.answerKey]))
    return knownConsentKeys.has(answerKey)||/^consent_\d+$/.test(answerKey)||!!consentTypeFromTitle(question)||question.includes("동의")||question.includes("약관")||question.includes("처리방침")
  }
  function normalizeConsentAnswer(value:any){
    if(value===true||String(value).toLowerCase()==="true")return"동의"
    if(value===false||String(value).toLowerCase()==="false")return"미동의"
    return value
  }
  function consentVirtualFieldId(answerKey:string,label:string){
    const safe=String(answerKey||label||"custom").replace(/[^A-Za-z0-9_-]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60)
    return `__consent_${safe||"custom"}`
  }
  function analyticsAttributionValue(row:any,key:string){
    const direct=row?.[key]
    if(direct!==undefined&&direct!==null&&String(direct).trim()!=="")return direct
    const fd=Array.isArray(row?.form_data)?row.form_data:[]
    const attributionItem=fd.find((item:any)=>String(item?.answerKey||"")==="_attribution"||String(item?.question||"")==="_attribution")
    const attribution=attributionItem?.answer&&typeof attributionItem.answer==="object"?attributionItem.answer:null
    const nested=attribution?.[key]
    return nested!==undefined&&nested!==null&&String(nested).trim()!==""?nested:""
  }
  function getAnalyticsFields(options?:{includeConsentFields?:boolean;includeAttributionFields?:boolean;rows?:any[]}){
    const raw:any[] = isKdt ? (cfg.kdtFields||[]) : (cfg.form.fields||[])
    const fields:any[]=raw.filter(f=>!isDisplayOnlyFieldType(f.type)).map(f=>({
      id:f.id,
      label:f.label||f.id,
      type:f.type,
      page:f.page||1,
      opts:(f.opts&&f.opts.length)?f.opts:(f.options||[]).map((o:any)=>({label:String(o),value:String(o)}))
    }))
    const addAttributionFields=(baseFields:any[])=>options?.includeAttributionFields
      ? [
          ...ATTRIBUTION_RESPONSE_FIELDS.map(field=>({
            ...field,
            type:"text",
            page:0,
            opts:[],
            readOnly:true,
            attributionField:true,
          })),
          ...baseFields,
        ]
      : baseFields
    if(!options?.includeConsentFields)return addAttributionFields(fields)
    const existingIds=new Set(fields.flatMap((field:any)=>[String(field.id||""),String(field.answerKey||"")].filter(Boolean)))
    const consentFields:any[]=[]
    const usedAnswerKeys=new Set<string>()
    const usedLabels=new Set<string>()
    const addConsentField=(label:string,answerKeys:any[])=>{
      const keys=Array.from(new Set(answerKeys.map(key=>String(key||"")).filter(Boolean)))
      if(keys.some(key=>existingIds.has(key)||usedAnswerKeys.has(key)))return
      const cleanLabel=String(label||"동의 항목").trim()||"동의 항목"
      if(!keys.length&&usedLabels.has(cleanLabel))return
      keys.forEach(key=>usedAnswerKeys.add(key))
      usedLabels.add(cleanLabel)
      const baseId=consentVirtualFieldId(keys[0]||"",cleanLabel)
      let id=baseId
      let suffix=2
      while(existingIds.has(id)||consentFields.some(field=>field.id===id)){
        id=`${baseId}_${suffix}`
        suffix+=1
      }
      consentFields.push({
        id,
        answerKey:keys[0]||id,
        answerKeys:keys,
        label:cleanLabel,
        type:"consent",
        page:9999,
        opts:[{label:"동의",value:"동의"},{label:"미동의",value:"미동의"}],
        readOnly:true,
        consentField:true,
      })
    }
    ;(Array.isArray(cfg.consents)?cfg.consents:[]).forEach((consent:any,index:number)=>{
      if(!consent?.enabled)return
      const type=String(consent?.consentType||consentTypeFromTitle(consent?.title)||"")
      const known=CONSENT_TYPES.find(item=>item.key===type)
      addConsentField(consent.title||consent.checkLabel||known?.label||`동의 항목 ${index+1}`,[consentConfigAnswerKey(consent,index),type,known?.answerKey,`consent_${index}`])
    })
    ;(options.rows||[]).forEach((row:any)=>{
      ;(Array.isArray(row?.form_data)?row.form_data:[]).forEach((item:any)=>{
        if(!isConsentAnswerItem(item))return
        const question=String(item?.question||"")
        const type=consentTypeFromTitle(question)
        const known=CONSENT_TYPES.find(consent=>consent.key===type)
        addConsentField(question||known?.label||String(item?.answerKey||"동의 항목"),[item?.answerKey,type,known?.answerKey])
      })
    })
    return addAttributionFields(consentFields.length?[...fields,...consentFields]:fields)
  }
  function analyticsRawAnswer(row:any,field:any){
    if(field.attributionField)return analyticsAttributionValue(row,field.answerKey||field.id)
    const answerKeys=Array.from(new Set([field.answerKey,field.id,...(Array.isArray(field.answerKeys)?field.answerKeys:[])].map(key=>String(key||"")).filter(Boolean)))
    const normalize=(value:any)=>field.consentField?normalizeConsentAnswer(value):value
    const direct=row[field.id]
    if(direct!==undefined&&direct!==null&&direct!=="")return normalize(direct)
    const directByAnswerKey=answerKeys.map(key=>row[key]).find(value=>value!==undefined&&value!==null&&value!=="")
    if(directByAnswerKey!==undefined&&directByAnswerKey!==null&&directByAnswerKey!=="")return normalize(directByAnswerKey)
    const fd=Array.isArray(row.form_data)?row.form_data:[]
    const hit=fd.find((x:any)=>answerKeys.includes(String(x.answerKey||"")))||fd.find((x:any)=>(x.question||"")===field.label)
    return normalize(hit?.answer)
  }
  function analyticsFieldOpts(field:any){
    const raw=(field?.opts&&field.opts.length)?field.opts:(field?.options||[])
    return raw.map((o:any)=>{
      const label=String(o?.label??o?.value??o)
      const value=String(o?.value??o?.label??o)
      const key=value.trim().toLowerCase()
      return {...(typeof o==="object"?o:{}),label,value,isEtc:!!o?.isEtc||label.trim()==="기타"||value.trim()==="기타"||key==="etc"||key==="other"}
    })
  }
  function analyticsOptionLabel(field:any,value:any){
    const raw=String(value??"").trim()
    if(!raw)return raw
    const opts=analyticsFieldOpts(field)
    if(!opts.length)return raw
    const etc=raw.match(/^([^:]+):\s*(.*)$/)
    if(etc){
      const prefix=analyticsOptionLabel(field,etc[1])
      return `${prefix||etc[1]}: ${etc[2]}`
    }
    const opt=opts.find((o:any)=>String(o.value)===raw)||opts.find((o:any)=>String(o.label)===raw)
    return opt?.label||raw
  }
  function isEmptyAnalyticsAnswer(ans:any){
    if(ans===undefined||ans===null||ans==="")return true
    if(Array.isArray(ans))return ans.length===0
    if(typeof ans==="object")return !Object.keys(ans).length
    return false
  }
  function analyticsFileItems(ans:any){
    const arr=Array.isArray(ans)?ans:[ans]
    return arr.filter((x:any)=>x&&typeof x==="object"&&(x.url||x.path||x.name)).map((x:any)=>({
      name:x.name||x.filename||x.path||"첨부파일",
      url:x.url||x.publicUrl||"",
      path:x.path||"",
      bucket:x.bucket||"form-uploads",
      size:x.size||0,
      type:x.type||""
    }))
  }
  function analyticsFieldFiles(srcRows:any[],field:any){
    return (srcRows||[]).flatMap((row:any,ri:number)=>{
      const dt=fmtAnalyticsDate(row.created_at)
      return analyticsFileItems(analyticsRawAnswer(row,field)).map((file:any,fi:number)=>({
        ...file,
        row,
        rowIndex:ri,
        fileIndex:fi,
        date:dt[0]||"date",
      }))
    })
  }
  function analyticsAnswer(row:any,field:any){
    const ans=analyticsRawAnswer(row,field)
    const files=analyticsFileItems(ans)
    if(files.length)return files.map((f:any)=>f.name).join(" / ")
    if(Array.isArray(ans))return ans.map((v:any)=>analyticsOptionLabel(field,v)).join(" / ")
    if(ans===undefined||ans===null||ans==="")return "없음"
    if(typeof ans==="object")return ans.name||ans.url||JSON.stringify(ans)
    return analyticsOptionLabel(field,ans)
  }
  function editableAnalyticsValue(row:any,field:any){
    const ans=analyticsRawAnswer(row,field)
    const files=analyticsFileItems(ans)
    if(files.length)return files.map((f:any)=>f.name).join("\n")
    if(Array.isArray(ans))return ans.map((v:any)=>analyticsOptionLabel(field,v)).join("\n")
    if(ans===undefined||ans===null)return ""
    if(typeof ans==="object")return ans.name||ans.url||JSON.stringify(ans,null,2)
    return analyticsOptionLabel(field,ans)
  }
  function parseEditedAnalyticsValue(field:any,value:string){
    if(field.type==="checkbox"){
      return String(value||"").split(/\n|\/|,/).map(v=>v.trim()).filter(Boolean)
    }
    return String(value??"").trim()
  }
  function openEditAnalyticsRow(row:any){
    const values:Record<string,string>={}
    getAnalyticsFields({includeConsentFields:true,rows:[row]}).forEach((field:any)=>{values[field.id]=editableAnalyticsValue(row,field)})
    setEditResponse({row,values})
  }
  async function saveEditedAnalyticsRow(fields:any[]){
    if(!supa||!editResponse?.row?.id)return
    setEditResponseSaving(true)
    try{
      const tableName=analyticsRowTable(editResponse.row)
      const existing=Array.isArray(editResponse.row.form_data)?editResponse.row.form_data.map((item:any)=>({...item})):[]
      const patch:any={form_data:existing}
      const upsertFormAnswer=(field:any,answer:any)=>{
        const idx=patch.form_data.findIndex((item:any)=>item.answerKey===field.id||(item.question||"")===field.label)
        const next={question:field.label||field.id,answer,answerKey:field.id}
        if(idx>=0)patch.form_data[idx]={...patch.form_data[idx],...next}
        else patch.form_data.push(next)
      }
      const referralIds=["referral","referral_source","referral_route"]
      fields.forEach((field:any)=>{
        if(field.readOnly)return
        if(field.type==="file")return
        const answer=parseEditedAnalyticsValue(field,editResponse.values[field.id]||"")
        upsertFormAnswer(field,answer)
        if(["name","phone","email"].includes(field.id))patch[field.id]=Array.isArray(answer)?answer.join(" / "):answer
        if(referralIds.includes(field.id))patch.referral_source=Array.isArray(answer)?answer.join(" / "):answer
        if(tableName==="company_applications"&&field.id==="manager_name")patch.manager_name=Array.isArray(answer)?answer.join(" / "):answer
      })
      const editedRowKey=analyticsRowKey(editResponse.row)
      const {data,error}=await supa.from(tableName).update(patch).eq("id",editResponse.row.id).select("*").single()
      if(error)throw error
      const nextRow={...(data||{...editResponse.row,...patch}),__tableName:tableName}
      setAnalyticsRows(prev=>prev.map(row=>analyticsRowKey(row)===editedRowKey?nextRow:row))
      setEditResponse(null)
      showToast("응답 데이터를 수정했어요.")
    }catch(e){
      showToast("응답 수정 실패: "+((e as any)?.message||"오류"),false)
    }finally{
      setEditResponseSaving(false)
    }
  }
  function analyticsValues(row:any,field:any){
    const norm=(v:any)=>{
      const s=analyticsOptionLabel(field,v||"없음").trim()
      return s.startsWith("기타:")? "기타" : s
    }
    const raw=analyticsRawAnswer(row,field)
    const files=analyticsFileItems(raw)
    if(files.length)return files.map((f:any)=>f.name)
    if(Array.isArray(raw))return raw.map((v:any)=>norm(v)).filter(Boolean)
    if(raw===undefined||raw===null||raw==="")return ["없음"]
    if(typeof raw==="object")return [raw.name||raw.url||JSON.stringify(raw)]
    return String(raw).split(" / ").map(v=>norm(v)).filter(Boolean)
  }
  function renderAnalyticsAnswer(row:any,field:any){
    const ans=analyticsRawAnswer(row,field)
    const files=analyticsFileItems(ans)
    if(files.length)return <div style={{display:"flex",flexDirection:"column" as const,gap:5}}>
      {files.map((f:any,i:number)=>f.url
        ? <button key={i} onClick={()=>setFilePreview(f)} style={{border:"none",background:"transparent",padding:0,color:A.blue,textDecoration:"none",fontWeight:400,fontFamily:FONT,fontSize:13,textAlign:"left" as const,cursor:"pointer",whiteSpace:"normal" as const,wordBreak:"break-word" as const,overflowWrap:"anywhere" as const}}>{f.name}</button>
        : <span key={i} style={{color:A.t1,whiteSpace:"normal" as const,wordBreak:"break-word" as const,overflowWrap:"anywhere" as const}}>{f.name}</span>)}
    </div>
    if(field.type==="checkbox"){
      const values=Array.isArray(ans)
        ? ans.map((v:any)=>analyticsOptionLabel(field,v)).filter(Boolean)
        : String(analyticsAnswer(row,field)).split(/\s*\/\s*/).map(v=>v.trim()).filter(Boolean)
      return <div style={{display:"flex",flexDirection:"column" as const,alignItems:"flex-start",gap:5}}>
        {(values.length?values:["없음"]).map((value:string,i:number)=><span key={`${value}_${i}`} style={{maxWidth:"100%",padding:"3px 7px",borderRadius:6,background:A.card,border:`1px solid ${A.border}`,whiteSpace:"normal" as const,wordBreak:"break-word" as const,overflowWrap:"anywhere" as const,lineHeight:1.35}}>{value}</span>)}
      </div>
    }
    const value=analyticsAnswer(row,field)
    return <span style={{display:"block",whiteSpace:"pre-wrap" as const,wordBreak:"break-word" as const,overflowWrap:"anywhere" as const,lineHeight:1.55}}>{value}</span>
  }
  function saveAnalyticsBlob(blob:Blob,name:string){
    const url=URL.createObjectURL(blob)
    const a=document.createElement("a")
    a.href=url
    a.download=name||"download"
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)
  }
  async function getAnalyticsFileBlob(file:any){
    let blob:Blob|null=null
    if(supa&&file.path){
      const dl=await supa.storage.from(file.bucket||"form-uploads").download(file.path)
      if(!dl.error&&dl.data)blob=dl.data
    }
    if(!blob&&file.url){
      const res=await fetch(file.url)
      if(!res.ok)throw new Error("download failed")
      blob=await res.blob()
    }
    if(!blob)throw new Error("download failed")
    return blob
  }
  function safeZipName(v:any,fallback="file"){
    const raw=String(v||fallback).replace(/[\\/:*?"<>|]/g,"_").replace(/\s+/g," ").trim()
    return raw||fallback
  }
  async function makeZipBlob(files:{name:string;blob:Blob}[]){
    const enc=new TextEncoder()
    const table=new Uint32Array(256)
    for(let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);table[i]=c>>>0}
    const crc32=(bytes:Uint8Array)=>{let c=0xffffffff;for(let i=0;i<bytes.length;i++)c=table[(c^bytes[i])&255]^(c>>>8);return (c^0xffffffff)>>>0}
    const u16=(a:Uint8Array,o:number,v:number)=>{a[o]=v&255;a[o+1]=(v>>>8)&255}
    const u32=(a:Uint8Array,o:number,v:number)=>{a[o]=v&255;a[o+1]=(v>>>8)&255;a[o+2]=(v>>>16)&255;a[o+3]=(v>>>24)&255}
    const localParts:any[]=[]
    const centralParts:any[]=[]
    let offset=0
    for(const f of files){
      const nameBytes=enc.encode(f.name)
      const dataBytes=new Uint8Array(await f.blob.arrayBuffer())
      const crc=crc32(dataBytes)
      const local=new Uint8Array(30+nameBytes.length)
      u32(local,0,0x04034b50);u16(local,4,20);u16(local,6,0x0800);u16(local,8,0);u16(local,10,0);u16(local,12,0)
      u32(local,14,crc);u32(local,18,dataBytes.length);u32(local,22,dataBytes.length);u16(local,26,nameBytes.length);u16(local,28,0)
      local.set(nameBytes,30)
      localParts.push(local,f.blob)
      const central=new Uint8Array(46+nameBytes.length)
      u32(central,0,0x02014b50);u16(central,4,20);u16(central,6,20);u16(central,8,0x0800);u16(central,10,0);u16(central,12,0);u16(central,14,0)
      u32(central,16,crc);u32(central,20,dataBytes.length);u32(central,24,dataBytes.length);u16(central,28,nameBytes.length);u16(central,30,0);u16(central,32,0);u16(central,34,0);u16(central,36,0);u32(central,38,0);u32(central,42,offset)
      central.set(nameBytes,46)
      centralParts.push(central)
      offset+=local.length+dataBytes.length
    }
    const cdOffset=offset
    const cdSize=centralParts.reduce((a:any,b:any)=>a+b.length,0)
    const end=new Uint8Array(22)
    u32(end,0,0x06054b50);u16(end,4,0);u16(end,6,0);u16(end,8,files.length);u16(end,10,files.length);u32(end,12,cdSize);u32(end,16,cdOffset);u16(end,20,0)
    return new Blob([...localParts,...centralParts,end],{type:"application/zip"})
  }
  async function downloadAnalyticsFilesZip(field:any,srcRows:any[]=analyticsRows){
    const files=analyticsFieldFiles(srcRows,field)
    if(!files.length){showToast("다운로드할 첨부파일이 없어요.",false);return}
    showToast(`첨부파일 ${files.length}개를 압축하는 중이에요.`)
    const folder=safeZipName(field.label||field.id||"attachments","attachments")
    const entries:{name:string;blob:Blob}[]=[]
    let failed=0
    for(const file of files){
      try{
        const blob=await getAnalyticsFileBlob(file)
        const baseName=safeZipName(file.name,`file_${file.rowIndex+1}_${file.fileIndex+1}`)
        entries.push({name:`${folder}/${String(file.rowIndex+1).padStart(3,"0")}_${file.date}_${String(file.fileIndex+1).padStart(2,"0")}_${baseName}`,blob})
      }catch(e){failed+=1}
    }
    if(!entries.length){showToast("첨부파일 다운로드에 실패했어요.",false);return}
    const zip=await makeZipBlob(entries)
    saveAnalyticsBlob(zip,`${folder}_첨부파일_${new Date().toISOString().slice(0,10)}.zip`)
    showToast(failed?`첨부파일 ${entries.length}개 다운로드 준비 완료 (${failed}개 실패)`: `첨부파일 ${entries.length}개 다운로드 준비 완료`)
  }
  async function downloadAnalyticsFile(file:any){
    if(!file?.url&&!file?.path)return
    try{
      saveAnalyticsBlob(await getAnalyticsFileBlob(file),file.name||"download")
    }catch(e){
      if(file.url)window.open(file.url,"_blank","noopener,noreferrer")
    }
  }
  function fmtAnalyticsDate(v:string){
    if(!v)return ["",""]
    const d=new Date(v)
    return [d.toLocaleDateString("sv-SE"),d.toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",hour12:false})]
  }
  function analyticsEventMeta(event:any){
    if(event?.__meta)return event.__meta
    try{return typeof event?.metadata==="string"?JSON.parse(event.metadata||"{}"):(event?.metadata||{})}catch{return{}}
  }
  function analyticsTrashSessionId(prefix="admin_trash"){
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  }
  function normalizeAnalyticsEventRows(rows:any[]){
    return Array.from(new Map((rows||[]).filter(Boolean).map((event:any)=>{
      const normalized={...event,__meta:analyticsEventMeta(event)}
      return [event.id||`${event.session_id||""}:${event.event_type||""}:${event.created_at||""}`,normalized]
    })).values()).sort((a:any,b:any)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())
  }
  function analyticsScopeCoversEvents(event:any,openTrashedBatchIds:Set<string>){
    const meta=analyticsEventMeta(event)
    return openTrashedBatchIds.has(meta.batch_id)||Number(meta.deleted_event_count||0)>0
  }
  function splitVisibleAnalyticsEvents(rawEvents:any[]){
    const metaOf=(event:any)=>analyticsEventMeta(event)
    const closedIds=new Set(rawEvents.filter(event=>["response_restored","analytics_scope_restored","response_purged","analytics_scope_purged"].includes(event.event_type)).map(event=>metaOf(event).trash_event_id).filter(Boolean))
    const purgedDraftSessions=new Set(rawEvents.filter(event=>event.event_type==="response_purged").map(event=>metaOf(event).session_id).filter(Boolean))
    const openTrashedBatchIds=new Set(rawEvents.filter(event=>event.event_type==="response_trashed"&&!closedIds.has(event.id)).map(event=>metaOf(event).batch_id).filter(Boolean))
    const activeScope=[...rawEvents]
      .filter(event=>event.event_type==="analytics_scope_trashed"&&!closedIds.has(event.id)&&analyticsScopeCoversEvents(event,openTrashedBatchIds))
      .sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0]
    const trashedDraftSessions=new Set(rawEvents.filter(event=>event.event_type==="response_trashed"&&!closedIds.has(event.id)&&metaOf(event).trash_kind==="draft"&&!purgedDraftSessions.has(metaOf(event).session_id)).map(event=>metaOf(event).session_id).filter(Boolean))
    return rawEvents.filter(event=>!analyticsTrashTypes.includes(event.event_type))
      .filter(event=>!activeScope||new Date(event.created_at).getTime()>new Date(activeScope.created_at).getTime())
      .filter(event=>!trashedDraftSessions.has(event.session_id))
  }
  function setAnalyticsEventRows(rawEventRows:any[]){
    const rawEvents=normalizeAnalyticsEventRows(rawEventRows)
    setAnalyticsTrashEvents(rawEvents)
    setAnalyticsEvents([...splitVisibleAnalyticsEvents(rawEvents)].reverse())
  }
  const analyticsTrashTypes=["response_trashed","response_restored","response_purged","analytics_scope_trashed","analytics_scope_restored","analytics_scope_purged"]
  function activeAnalyticsTrashRecords(source:any[]=analyticsTrashEvents){
    const closedIds=new Set(source.filter(event=>["response_restored","analytics_scope_restored","response_purged","analytics_scope_purged"].includes(event.event_type)).map(event=>analyticsEventMeta(event).trash_event_id).filter(Boolean))
    const purgedBatchIds=new Set(source.filter(event=>event.event_type==="analytics_scope_purged").map(event=>analyticsEventMeta(event).batch_id).filter(Boolean))
    const purgedDraftSessions=new Set(source.filter(event=>event.event_type==="response_purged").map(event=>analyticsEventMeta(event).session_id).filter(Boolean))
    const activeScopes=source.filter(event=>event.event_type==="analytics_scope_trashed"&&!closedIds.has(event.id))
    const activeBatchIds=new Set(activeScopes.map(event=>analyticsEventMeta(event).batch_id).filter(Boolean))
    return source.filter(event=>{
      if(!["response_trashed","analytics_scope_trashed"].includes(event.event_type)||closedIds.has(event.id))return false
      const meta=analyticsEventMeta(event)
      if(meta.batch_id&&purgedBatchIds.has(meta.batch_id))return false
      if(meta.session_id&&purgedDraftSessions.has(meta.session_id))return false
      return event.event_type==="analytics_scope_trashed"||!meta.batch_id||!activeBatchIds.has(meta.batch_id)
    }).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())
  }
  async function insertAnalyticsEventsForForm(formId:string,formSlug:string,events:{event_type:string;session_id?:string;metadata?:any}[]){
    if(!supa||!formId||!events.length)return[] as any[]
    const payloads=events.map(event=>({form_id:formId,form_slug:formSlug||"",session_id:event.session_id||analyticsTrashSessionId(),event_type:event.event_type,page:1,metadata:event.metadata||{}}))
    const inserted:any[]=[]
    for(let i=0;i<payloads.length;i+=100){
      const {data,error}=await supa.from("form_response_events").insert(payloads.slice(i,i+100)).select("*")
      if(error)throw error
      inserted.push(...(data||[]))
    }
    return inserted
  }
  async function insertAnalyticsAdminEvents(events:{event_type:string;session_id?:string;metadata?:any}[]){
    if(!loadedId||!events.length)return[] as any[]
    return insertAnalyticsEventsForForm(loadedId,savedSlug||"",events)
  }
  async function insertAnalyticsAdminEvent(event_type:string,metadata:any,session_id?:string){
    return (await insertAnalyticsAdminEvents([{event_type,metadata,session_id}]))[0]
  }
  async function restoreActiveAnalyticsTrashForForm(formId:string,formSlug:string){
    if(!supa||!formId)return 0
    const {data,error}=await supa.from("form_response_events").select(ANALYTICS_EVENT_SELECT).eq("form_id",formId).order("created_at",{ascending:false}).limit(ANALYTICS_EVENT_LIMIT)
    if(error)throw error
    const rawEvents=data||[]
    const closedIds=new Set(rawEvents.filter(event=>["response_restored","analytics_scope_restored","response_purged","analytics_scope_purged"].includes(event.event_type)).map(event=>analyticsEventMeta(event).trash_event_id).filter(Boolean))
    const activeScopes=rawEvents.filter(event=>event.event_type==="analytics_scope_trashed"&&!closedIds.has(event.id)).sort((a,b)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime())
    let restoredScopes=0
    for(const scopeEvent of activeScopes){
      const meta=analyticsEventMeta(scopeEvent)
      const batchEvents=rawEvents.filter(event=>event.event_type==="response_trashed"&&!closedIds.has(event.id)&&analyticsEventMeta(event).batch_id&&analyticsEventMeta(event).batch_id===meta.batch_id)
      const submitted=batchEvents.filter(event=>analyticsEventMeta(event).trash_kind==="submitted")
      for(const tableName of Array.from(new Set(submitted.map(event=>analyticsEventMeta(event).table_name||analyticsTableName())))){
        const sourceRows=submitted.filter(event=>(analyticsEventMeta(event).table_name||analyticsTableName())===tableName).map(event=>analyticsEventMeta(event).original_row).filter(Boolean)
        if(sourceRows.length){
          const {error:upsertError}=await supa.from(tableName).upsert(sourceRows,{onConflict:"id",ignoreDuplicates:true})
          if(upsertError)throw upsertError
        }
      }
      const restoredAt=new Date().toISOString()
      await insertAnalyticsEventsForForm(formId,formSlug,[
        ...batchEvents.map(event=>({event_type:"response_restored",metadata:{trash_event_id:event.id,restored_at:restoredAt,restore_reason:"form_restored"}})),
        {event_type:"analytics_scope_restored",metadata:{trash_event_id:scopeEvent.id,batch_id:meta.batch_id,restored_at:restoredAt,restore_reason:"form_restored"}},
      ])
      restoredScopes+=1
    }
    return restoredScopes
  }
  function analyticsCandidateTableNames(){
    const preferred=analyticsTableName()
    return preferred==="company_applications"?["company_applications","applications"]:["applications","company_applications"]
  }
  function analyticsRowTable(row:any){
    return String(row?.__tableName||analyticsTableName())
  }
  function analyticsRowKey(row:any){
    if(row?.__draft)return `draft:${row.__sessionId||row.id||row.created_at||""}`
    return `${analyticsRowTable(row)}:${row?.id||""}`
  }
  function stripAnalyticsInternalRow(row:any){
    const clean:any={}
    Object.entries(row||{}).forEach(([key,value])=>{if(!key.startsWith("__"))clean[key]=value})
    return clean
  }
  async function loadAnalytics(){
    if(!supa||!loadedId){setAnalyticsErr("저장된 폼을 먼저 선택해주세요.");return}
    setAnalyticsLoading(true);setAnalyticsErr("")
    try{
      const tableNames=analyticsCandidateTableNames()
      const [rowResults,eventResult]=await Promise.all([
        Promise.all(tableNames.map(async tableName=>{
          const res=await supa.from(tableName).select("*").eq("form_id",loadedId).order("created_at",{ascending:false}).limit(1000)
          if(res.error)throw res.error
          return (res.data||[]).map((row:any)=>({...row,__tableName:tableName}))
        })),
        supa.from("form_response_events").select(ANALYTICS_EVENT_SELECT).eq("form_id",loadedId).order("created_at",{ascending:false}).limit(ANALYTICS_EVENT_LIMIT),
      ])
      const rows=rowResults.flat().sort((a:any,b:any)=>new Date(b.created_at||0).getTime()-new Date(a.created_at||0).getTime())
      let eventError=eventResult.error
      let rawEventRows=eventError?[]:(eventResult.data||[])
      if((eventError||rawEventRows.length===0)&&typeof window!=="undefined"){
        try{
          const {data:sessionData}=await supa.auth.getSession()
          const token=sessionData?.session?.access_token||""
          if(token){
            const params=new URLSearchParams({formId:loadedId})
            if(savedSlug)params.set("slug",savedSlug)
            const response=await fetch(`/api/admin/form-response-events?${params.toString()}`,{headers:{authorization:`Bearer ${token}`},cache:"no-store"})
            if(response.ok){
              const payload=await response.json()
              if(Array.isArray(payload?.events)){
                rawEventRows=payload.events
                eventError=null
              }
            }
          }
        }catch{}
      }
      if(eventError&&rawEventRows.length===0)throw eventError
      setAnalyticsRows(rows)
      setAnalyticsEventRows(rawEventRows)
      const fields=getAnalyticsFields()
      if(!analyticsQuestionId&&fields[0]){
        setAnalyticsQuestionId(fields[0].id)
        setAnalyticsSection(fields[0].page||1)
      }
    } catch(e){
      setAnalyticsErr((e as any)?.message||"응답 데이터를 불러오지 못했어요.")
      setAnalyticsRows([]);setAnalyticsEvents([]);setAnalyticsTrashEvents([])
    } finally {setAnalyticsLoading(false)}
  }
  function analyticsTableName(){
    return isCompanyApplicationConfig(cfg)?"company_applications":"applications"
  }
  async function deleteSelectedAnalyticsRows(targetRows:any[]){
    if(!supa||!loadedId)return
    const rowsToDelete=targetRows.filter(Boolean)
    if(!rowsToDelete.length){
      showToast("삭제할 응답을 선택해주세요.",false)
      return
    }
    if(!confirm(`선택한 ${rowsToDelete.length}개 응답을 휴지통으로 이동할까요?`))return
    setAnalyticsSelectedDeleteBusy(true)
    const deletedAt=new Date().toISOString()
    const batchId=analyticsTrashSessionId("selected_trash")
    const insertedTrashIds:string[]=[]
    const deletedGroups:{tableName:string;rows:any[]}[]=[]
    try{
      const drafts=rowsToDelete.filter(row=>row.__draft)
      const submitted=rowsToDelete.filter(row=>!row.__draft&&row.id)
      const submittedByTable=new Map<string,any[]>()
      submitted.forEach(row=>{
        const tableName=analyticsRowTable(row)
        submittedByTable.set(tableName,[...(submittedByTable.get(tableName)||[]),row])
      })
      const trashEvents=await insertAnalyticsAdminEvents([
        ...drafts.map(row=>({event_type:"response_trashed",session_id:row.__sessionId,metadata:{trash_kind:"draft",session_id:row.__sessionId,original_row:row,batch_id:batchId,deleted_at:deletedAt}})),
        ...submitted.map(row=>({event_type:"response_trashed",metadata:{trash_kind:"submitted",table_name:analyticsRowTable(row),original_row:stripAnalyticsInternalRow(row),batch_id:batchId,deleted_at:deletedAt}})),
      ])
      trashEvents.forEach(event=>{if(event?.id)insertedTrashIds.push(event.id)})
      for(const [tableName,tableRows] of submittedByTable.entries()){
        const ids=tableRows.map(row=>row.id).filter(Boolean)
        if(!ids.length)continue
        const {error}=await supa.from(tableName).delete().in("id",ids)
        if(error)throw error
        deletedGroups.push({tableName,rows:tableRows.map(stripAnalyticsInternalRow)})
      }
      setSelectedAnalyticsRowIds([])
      await loadAnalytics()
      showToast(`${rowsToDelete.length}개 응답을 휴지통으로 이동했어요.`)
    }catch(error){
      for(const group of deletedGroups){
        try{await supa.from(group.tableName).upsert(group.rows,{onConflict:"id",ignoreDuplicates:true})}catch{}
      }
      if(insertedTrashIds.length){
        try{await supa.from("form_response_events").delete().in("id",insertedTrashIds)}catch{}
      }
      showToast("선택 응답 삭제 실패: "+((error as any)?.message||"오류"),false)
    }finally{
      setAnalyticsSelectedDeleteBusy(false)
    }
  }
  async function deleteAllAnalyticsData(){
    if(!supa||!loadedId)return
    setActionLoading("응답 데이터를 휴지통으로 이동하는 중이에요.")
    try{
      const tableNames=analyticsCandidateTableNames()
      const responseGroups=await Promise.all(tableNames.map(async tableName=>{
        const responseRows=await supa.from(tableName).select("*").eq("form_id",loadedId).limit(10000)
        if(responseRows.error)throw responseRows.error
        return {tableName,rows:responseRows.data||[]}
      }))
      const batchId=analyticsTrashSessionId("trash_batch")
      const allRows=responseGroups.flatMap(group=>group.rows.map((row:any)=>({tableName:group.tableName,row})))
      const deletedAt=new Date().toISOString()
      const deletedEventCount=analyticsEvents.filter(event=>!analyticsTrashTypes.includes(event.event_type)).length
      await insertAnalyticsAdminEvents(allRows.map(({tableName,row})=>({event_type:"response_trashed",metadata:{trash_kind:"submitted",table_name:tableName,original_row:row,batch_id:batchId,deleted_at:deletedAt}})))
      for(const tableName of tableNames){
        const res=await supa.from(tableName).delete().eq("form_id",loadedId)
        if(res.error)throw res.error
      }
      await insertAnalyticsAdminEvent("analytics_scope_trashed",{trash_kind:"scope",batch_id:batchId,deleted_count:allRows.length,deleted_event_count:deletedEventCount,deleted_at:deletedAt})
      setShowDeleteAllAnalytics(false)
      await loadAnalytics()
      showToast("해당 폼의 응답 데이터와 기간별 인사이트를 휴지통으로 이동했어요.")
    } catch(e){
      showToast("전체 응답 삭제 실패: "+((e as any)?.message||"오류"),false)
    } finally {
      setActionLoading("")
    }
  }
  async function restoreAnalyticsTrash(event:any){
    if(!supa||!event)return
    setAnalyticsTrashBusy(true)
    try{
      const meta=analyticsEventMeta(event)
      if(event.event_type==="analytics_scope_trashed"){
        const batchEvents=analyticsTrashEvents.filter(item=>item.event_type==="response_trashed"&&analyticsEventMeta(item).batch_id===meta.batch_id)
        const submitted=batchEvents.filter(item=>analyticsEventMeta(item).trash_kind==="submitted")
        for(const tableName of Array.from(new Set(submitted.map(item=>analyticsEventMeta(item).table_name||analyticsTableName())))){
          const sourceRows=submitted.filter(item=>(analyticsEventMeta(item).table_name||analyticsTableName())===tableName).map(item=>analyticsEventMeta(item).original_row).filter(Boolean)
          if(sourceRows.length){
            const {error}=await supa.from(tableName).insert(sourceRows)
            if(error)throw error
          }
        }
        await insertAnalyticsAdminEvents([
          ...batchEvents.map(item=>({event_type:"response_restored",metadata:{trash_event_id:item.id,restored_at:new Date().toISOString()}})),
          {event_type:"analytics_scope_restored",metadata:{trash_event_id:event.id,batch_id:meta.batch_id,restored_at:new Date().toISOString()}},
        ])
      }else if(meta.trash_kind==="submitted"){
        const {error}=await supa.from(meta.table_name||analyticsTableName()).insert(meta.original_row)
        if(error)throw error
        await insertAnalyticsAdminEvent("response_restored",{trash_event_id:event.id,restored_at:new Date().toISOString()})
      }else{
        await insertAnalyticsAdminEvent("response_restored",{trash_event_id:event.id,restored_at:new Date().toISOString()})
      }
      await loadAnalytics()
      showToast("휴지통의 응답을 복구했어요.")
    }catch(error){showToast("응답 복구 실패: "+((error as any)?.message||"오류"),false)}
    finally{setAnalyticsTrashBusy(false)}
  }
  async function purgeAnalyticsTrash(event:any){
    if(!supa||!event||!confirm("이 기록을 영구 삭제할까요? 영구 삭제 후에는 복구할 수 없어요."))return
    setAnalyticsTrashBusy(true)
    try{
      const meta=analyticsEventMeta(event)
      if(event.event_type==="analytics_scope_trashed"){
        const {error}=await supa.from("form_response_events").delete().eq("form_id",loadedId).lte("created_at",event.created_at)
        if(error)throw error
        await insertAnalyticsAdminEvent("analytics_scope_purged",{trash_event_id:event.id,batch_id:meta.batch_id,purged_at:new Date().toISOString()})
      }else{
        if(meta.trash_kind==="draft"&&meta.session_id){
          const {error}=await supa.from("form_response_events").delete().eq("form_id",loadedId).eq("session_id",meta.session_id)
          if(error)throw error
        }
        const {error}=await supa.from("form_response_events").delete().eq("id",event.id)
        if(error)throw error
        await insertAnalyticsAdminEvent("response_purged",{trash_event_id:event.id,session_id:meta.session_id,batch_id:meta.batch_id,purged_at:new Date().toISOString()})
      }
      await loadAnalytics()
      showToast("휴지통 기록을 영구 삭제했어요.")
    }catch(error){showToast("영구 삭제 실패: "+((error as any)?.message||"오류"),false)}
    finally{setAnalyticsTrashBusy(false)}
  }
  React.useEffect(()=>{
    if(view==="analytics")loadAnalytics()
  },[view,loadedId])
  React.useEffect(()=>{
    setSelectedAnalyticsRowIds([])
    setExpandedDuplicateResponseGroups([])
  },[loadedId,analyticsResponseScope])
  function exportAnalyticsCsv(srcRows:any[]=analyticsRows,fileSuffix="responses"){
    const fields=getAnalyticsFields({includeConsentFields:true,includeAttributionFields:analyticsResponseScope==="submitted",rows:srcRows})
    const headers=["날짜","시간",...fields.map(f=>f.label)]
    const csvEscape=(v:any)=>`"${String(v??"").replace(/"/g,'""')}"`
    const lines=[headers.map(csvEscape).join(",")]
    const csvRows=[...(srcRows||[])].sort((a:any,b:any)=>{
      const at=new Date(a?.created_at||0).getTime()
      const bt=new Date(b?.created_at||0).getTime()
      const aTime=Number.isFinite(at)?at:0
      const bTime=Number.isFinite(bt)?bt:0
      return analyticsCsvSort==="asc"?aTime-bTime:bTime-aTime
    })
    csvRows.forEach(row=>{
      const [date,time]=fmtAnalyticsDate(row.created_at)
      const values=[date,time,...fields.map(f=>analyticsAnswer(row,f))]
      lines.push(values.map(csvEscape).join(","))
    })
    const blob=new Blob(["\ufeff"+lines.join("\n")],{type:"text/csv;charset=utf-8"})
    const url=URL.createObjectURL(blob)
    const a=document.createElement("a")
    a.href=url
    a.download=`${(loadedName||"form-responses").replace(/[\\/:*?"<>|]/g,"_")}_${fileSuffix}.csv`
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)
  }

  // ── Auto-save ────────────────────────────────────────────────────────
  React.useEffect(()=>{
    if(!supa||!loadedId||view!=="builder")return
    if(autoSaveTimer.current)clearTimeout(autoSaveTimer.current)
    if(unlinkedOperationPeriodError())return
    setAutoSaved(false)
    setAutoSaving(false)
    autoSaveTimer.current=setTimeout(()=>{
      setAutoSaving(true)
      const cfgFinal=applyBrandDefaults({...cfg,brand:currentBrand,dashboard:dashboardWithOperationPeriods(cfg.dashboard)},currentBrand)
      supa.from("form_configs").update({config:cfgFinal,brand:dbBrandValue(currentBrand),updated_at:new Date().toISOString()}).eq("id",loadedId)
        .then(({error})=>{
          setAutoSaving(false)
          if(!error){
            setAutoSaved(true)
            void syncLinkedProgramResponses(loadedId,cfgFinal)
          }
        })
    },2000)
    return ()=>{if(autoSaveTimer.current)clearTimeout(autoSaveTimer.current)}
  },[cfg,currentBrand,loadedId,view,supa])

  // ── Image upload ──────────────────────────────────────────────────────
  function setImageNaturalSize(target:"header"|"field"|"ad",url:string,fieldId?:string){
    const img=new Image()
    img.onload=()=>{
      const patch={imageNaturalW:img.naturalWidth||0,imageNaturalH:img.naturalHeight||0}
      if(target==="header")setCfg(p=>p.header.imageUrl===url?{...p,header:{...p.header,...patch}}:p)
      else if(target==="ad")setCfg(p=>p.ad?.imageUrl===url?{...p,ad:{...DEFAULT_FORM_AD,...(p.ad||{}),...patch}}:p)
      else if(fieldId)patchImageFieldById(fieldId,patch)
    }
    img.src=url
  }
  async function onImg(e:React.ChangeEvent<HTMLInputElement>){
    const f=e.target.files?.[0];if(!f)return
    try {
      const url=await readCompressedImageFile(f)
      setCfg(p=>({...p,header:{...p.header,imageUrl:url,imageFit:"contain",imagePosX:50,imagePosY:50,imageCropX:0,imageCropY:0,imageCropW:100,imageCropH:100}}))
      if(url)setImageNaturalSize("header",url)
    } catch {
      showToast("이미지 업로드에 실패했어요.", false)
    } finally {
      e.target.value=""
    }
  }
  const imageFit=(img:any)=>img?.imageFit==="cover"?"cover":"contain"
  const imagePos=(img:any)=>`${img?.imagePosX??50}% ${img?.imagePosY??50}%`
  const cropNumber=(v:any,d:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(Number(v))?Number(v):d))
  function imageCropBox(img:any){
    const w=cropNumber(img?.imageCropW,100,8,100)
    const h=cropNumber(img?.imageCropH,100,8,100)
    const x=cropNumber(img?.imageCropX,0,0,100-w)
    const y=cropNumber(img?.imageCropY,0,0,100-h)
    return{x,y,w,h}
  }
  const hasImageCrop=(img:any)=>imageFit(img)==="cover"&&Number.isFinite(Number(img?.imageCropW))&&Number.isFinite(Number(img?.imageCropH))
  function imageCropAspect(img:any){
    const b=imageCropBox(img)
    const nw=Number(img?.imageNaturalW)||100
    const nh=Number(img?.imageNaturalH)||100
    return Math.max(0.25,Math.min(5,(b.w*nw)/(b.h*nh)))
  }
  function croppedImageStyle(img:any):React.CSSProperties{
    const b=imageCropBox(img)
    return {
      position:"absolute" as const,
      width:`${10000/b.w}%`,
      height:`${10000/b.h}%`,
      left:`-${(b.x/b.w)*100}%`,
      top:`-${(b.y/b.h)*100}%`,
      objectFit:"fill" as const,
      display:"block",
    }
  }
  function imagePreviewBoxStyle(img:any,coverHeight:number):React.CSSProperties{
    return hasImageCrop(img)
      ? {width:"100%",aspectRatio:String(imageCropAspect(img)),borderRadius:A.r,overflow:"hidden",position:"relative" as const,background:A.card2}
      : {width:"100%",height:imageFit(img)==="cover"?coverHeight:"auto",borderRadius:A.r,overflow:"hidden",position:"relative" as const,background:A.card2}
  }
  function imagePreviewImgStyle(img:any):React.CSSProperties{
    return hasImageCrop(img)
      ? croppedImageStyle(img)
      : {width:"100%",height:imageFit(img)==="cover"?"100%":"auto",display:"block",objectFit:imageFit(img),objectPosition:imagePos(img)}
  }
  function renderPreviewAdSlot(field:any){
    const mode=field.adMode==="split"?"split":"image"
    const bg=field.adBg||accentBg+"14"
    const textColor=seniorMode?FC.t1:field.adTextColor||FC.t1
    const hasElementImage=!!field.adElementImageUrl
    const compactHeight=60
    const imageField={...field,imageFit:field.imageFit||"cover"}
    if(mode==="image"){
      return <div style={{position:"relative" as const,borderRadius:14,overflow:"hidden",border:`1px solid ${FC.fieldBorder}`,background:FC.fieldBg}}>
        {field.imageUrl
          ? <div style={{...imagePreviewBoxStyle(imageField,112),borderRadius:14,background:FC.fieldBg}}>
              <img src={field.imageUrl} alt={field.imageCaption||"광고"} style={imagePreviewImgStyle(imageField)}/>
            </div>
          : <div style={{height:96,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px",fontSize:fs(13),color:FC.t3,fontWeight:600,border:`1.5px dashed ${FC.fieldBorder}`,borderRadius:14,background:FC.fieldBg}}>
              이미지 배너를 업로드해주세요. {AD_IMAGE_SIZE_TEXT}
            </div>}
      </div>
    }
    return <div style={{position:"relative" as const,height:compactHeight,display:"flex",alignItems:"stretch",justifyContent:"space-between",gap:hasElementImage?10:8,padding:hasElementImage?"0 8px 0 12px":"6px 12px",borderRadius:14,border:"none",background:bg,color:textColor,overflow:"hidden"}}>
      <div style={{minWidth:0,flex:1,display:"flex",flexDirection:"column" as const,justifyContent:"center",padding:0,overflow:"hidden"}}>
        <div style={{fontSize:fs(13),fontWeight:600,lineHeight:1.1,letterSpacing:seniorMode?0:"-0.2px",whiteSpace:"nowrap" as const,overflow:"hidden",textOverflow:"ellipsis"}}>{field.adMainText||"광고 메인 문구"}</div>
        <div style={{fontSize:fs(10.5),fontWeight:400,lineHeight:1.1,opacity:seniorMode?0.9:0.72,marginTop:5,whiteSpace:"nowrap" as const,overflow:"hidden",textOverflow:"ellipsis"}}>{field.adSubText||"광고 서브 문구"}</div>
      </div>
      <div style={{width:hasElementImage?"42%":64,minWidth:hasElementImage?96:undefined,maxWidth:hasElementImage?150:undefined,alignSelf:hasElementImage?"stretch":"center",height:hasElementImage?"auto":28,borderRadius:hasElementImage?0:9,background:hasElementImage?"transparent":"rgba(255,255,255,0.42)",border:hasElementImage?"none":"1px solid rgba(255,255,255,0.45)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,color:textColor,fontSize:fs(11),fontWeight:800,textAlign:"center" as const,padding:hasElementImage?0:4,boxSizing:"border-box" as const}}>
        {field.adElementImageUrl
          ? <img src={field.adElementImageUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
          : <span style={{lineHeight:1.25,whiteSpace:"pre-line" as const}}>{field.adElementText||"요소"}</span>}
      </div>
    </div>
  }
  function patchImageFieldById(fieldId:string,patch:any){
    setCfg(p=>({
      ...p,
      form:{...p.form,fields:(p.form.fields||[]).map((f:any)=>f.id===fieldId?{...f,...patch}:f)},
      kdtFields:p.kdtFields?(p.kdtFields||[]).map((f:any)=>f.id===fieldId?{...f,...patch}:f):p.kdtFields,
    }))
  }
  function openImageCropModal(target:"header"|"field"|"ad",img:any,fieldId?:string){
    if(!img?.imageUrl)return
    setImageCropModal({
      target,
      fieldId,
      imageUrl:img.imageUrl,
      imageFit:"cover",
      imagePosX:Number.isFinite(Number(img.imagePosX))?Number(img.imagePosX):50,
      imagePosY:Number.isFinite(Number(img.imagePosY))?Number(img.imagePosY):50,
      imageCropX:Number.isFinite(Number(img.imageCropX))?Number(img.imageCropX):0,
      imageCropY:Number.isFinite(Number(img.imageCropY))?Number(img.imageCropY):0,
      imageCropW:Number.isFinite(Number(img.imageCropW))?Number(img.imageCropW):100,
      imageCropH:Number.isFinite(Number(img.imageCropH))?Number(img.imageCropH):100,
      imageNaturalW:Number(img.imageNaturalW)||0,
      imageNaturalH:Number(img.imageNaturalH)||0,
    })
  }
  function applyImageCropModal(){
    if(!imageCropModal)return
    const patch={
      imageFit:imageCropModal.imageFit,
      imagePosX:imageCropModal.imagePosX,
      imagePosY:imageCropModal.imagePosY,
      imageCropX:imageCropModal.imageCropX,
      imageCropY:imageCropModal.imageCropY,
      imageCropW:imageCropModal.imageCropW,
      imageCropH:imageCropModal.imageCropH,
      imageNaturalW:imageCropModal.imageNaturalW,
      imageNaturalH:imageCropModal.imageNaturalH,
    }
    if(imageCropModal.target==="header"){
      setCfg(p=>({...p,header:{...p.header,...patch}}))
    }else if(imageCropModal.target==="ad"){
      setCfg(p=>({...p,ad:{...DEFAULT_FORM_AD,...(p.ad||{}),...patch}}))
    }else if(imageCropModal.fieldId){
      patchImageFieldById(imageCropModal.fieldId,patch)
    }
    setImageCropModal(null)
  }
  function renderImageCropControls(img:any,onCrop:()=>void,onReset:()=>void){
    const fit=imageFit(img)
    return <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
      <button onClick={onCrop}
        style={{height:32,padding:"0 11px",borderRadius:A.r,border:`1px solid ${fit==="cover"?A.blue+"55":A.border}`,background:fit==="cover"?A.blue2:A.card2,color:fit==="cover"?A.blue:A.t2,fontFamily:FONT,fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 2v10h10M2 4h10v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {fit==="cover"?"자르기 편집":"자르기 설정"}
      </button>
      {fit==="cover"&&<button onClick={onReset}
        style={{height:32,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:"transparent",color:A.t3,fontFamily:FONT,fontSize:12,fontWeight:600,cursor:"pointer"}}>
        전체보기
      </button>}
      <span style={{fontSize:11.5,color:A.t3,marginLeft:2}}>{fit==="cover"?"잘림 영역 적용 중":"이미지 전체 표시"}</span>
    </div>
  }
  function startImageCropDrag(kind:string,e:React.MouseEvent<HTMLElement>){
    e.preventDefault();e.stopPropagation()
    const stage=(e.currentTarget as HTMLElement).closest("[data-crop-stage]") as HTMLElement|null
    const rect=stage?.getBoundingClientRect()
    if(!rect||!imageCropModal)return
    const startX=e.clientX,startY=e.clientY
    const start={x:imageCropModal.imageCropX,y:imageCropModal.imageCropY,w:imageCropModal.imageCropW,h:imageCropModal.imageCropH}
    const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))
    const minSize=8
    const onMove=(ev:MouseEvent)=>{
      const dx=((ev.clientX-startX)/rect.width)*100
      const dy=((ev.clientY-startY)/rect.height)*100
      setImageCropModal(m=>{
        if(!m)return m
        let{x,y,w,h}=start
        if(kind==="move"){
          x=clamp(start.x+dx,0,100-start.w)
          y=clamp(start.y+dy,0,100-start.h)
        }else{
          if(kind.includes("e"))w=clamp(start.w+dx,minSize,100-start.x)
          if(kind.includes("s"))h=clamp(start.h+dy,minSize,100-start.y)
          if(kind.includes("w")){
            const nx=clamp(start.x+dx,0,start.x+start.w-minSize)
            w=start.w+(start.x-nx);x=nx
          }
          if(kind.includes("n")){
            const ny=clamp(start.y+dy,0,start.y+start.h-minSize)
            h=start.h+(start.y-ny);y=ny
          }
        }
        return{...m,imageCropX:x,imageCropY:y,imageCropW:w,imageCropH:h}
      })
    }
    const onUp=()=>{document.removeEventListener("mousemove",onMove);document.removeEventListener("mouseup",onUp)}
    document.addEventListener("mousemove",onMove)
    document.addEventListener("mouseup",onUp)
  }

  // ── Options ───────────────────────────────────────────────────────────
  // addOpt / rmOpt now target a specific field's opts
  function addFieldOpt(fieldIdx:number){if(!newLbl.trim())return;const v=newVal.trim()||newLbl.trim();const cur=cfg.form.fields[fieldIdx]?.opts||[];updateField(fieldIdx,{opts:[...cur,{label:newLbl.trim(),value:v,isEtc:newLbl.trim()==="기타"}]});setNewLbl("");setNewVal("")}
  function rmFieldOpt(fieldIdx:number,optIdx:number){const cur=cfg.form.fields[fieldIdx]?.opts||[];updateField(fieldIdx,{opts:cur.filter((_:any,i:number)=>i!==optIdx)})}

  // ── Copy ─────────────────────────────────────────────────────────────
  function copyJSON(){navigator.clipboard.writeText(JSON.stringify(cfg,null,2));showToast("JSON 복사 완료!")}

  function renderEditorTabsStrip(){
    const stripBg=adminDark?"#121419":"#F2F3F5"
    const activeBg=A.card
    const edge=adminDark?"rgba(255,255,255,0.08)":"#D5D9DF"
    const tabBorder="transparent"
    const homeActive=view==="dashboard"
    const iconColor=(active:boolean)=>active?A.blue:A.t3
    const tabIcon=(active:boolean)=><svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{flexShrink:0,color:iconColor(active)}}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" fill={active?A.blue2:(adminDark?A.card2:"#EDEFF2")}/>
      <path d="M9.5 9.5h5M9.5 12.8h5M9.5 16h3" stroke={active?A.blue:A.t3} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
    return <div style={{height:52,background:stripBg,display:"flex",alignItems:"center",gap:6,padding:"0 14px",boxSizing:"border-box" as const,flexShrink:0,overflow:"hidden"}}>
      <button onClick={()=>{rememberActiveEditorTab();setView("dashboard")}} title="폼 리스트"
        style={{width:36,height:36,border:`1px solid ${homeActive?edge:"transparent"}`,borderRadius:10,background:homeActive?activeBg:"transparent",boxShadow:homeActive?"0 1px 3px rgba(16,24,40,.10)":"none",color:iconColor(homeActive),display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.5 10.5 12 4l8.5 6.5V19a1.2 1.2 0 0 1-1.2 1.2h-4.4v-5.6H9.1v5.6H4.7A1.2 1.2 0 0 1 3.5 19v-8.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/></svg>
      </button>
      <div style={{display:"flex",alignItems:"center",gap:6,overflowX:"auto" as const,overflowY:"hidden" as const,scrollbarWidth:"none" as any,flex:1,minWidth:0}}>
        {editorTabs.map((tab,index)=>{
          const active=view==="builder"&&tab.key===activeEditorTabKey
          const label=editorTabLabel(tab)
          return <div key={tab.key} role="button" tabIndex={0} onClick={()=>activateEditorTab(tab.key)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")activateEditorTab(tab.key)}}
            title={label}
            style={{height:36,maxWidth:250,padding:"0 8px 0 10px",border:`1px solid ${tabBorder}`,borderRadius:12,background:active?activeBg:"transparent",boxShadow:active?"0 1px 3px rgba(16,24,40,.10)":"none",color:active?A.t1:A.t2,fontFamily:FONT,fontSize:13,fontWeight:active?600:500,cursor:"pointer",display:"flex",alignItems:"center",gap:8,flexShrink:0,position:"relative" as const,outline:"none",transition:"background .12s,box-shadow .12s"}}>
            {tabIcon(active)}
            <span style={{minWidth:0,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>
              {label}
            </span>
            {!tab.id&&<span title="저장 전" style={{width:6,height:6,borderRadius:"50%",background:active?A.blue:A.t3,flexShrink:0}}/>}
            <button type="button" onClick={e=>{e.stopPropagation();closeEditorTab(tab.key)}} title="편집창 닫기" aria-label="편집창 닫기"
              style={{width:20,height:20,borderRadius:6,border:"none",background:"transparent",color:active?A.t2:A.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=adminDark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)";(e.currentTarget as HTMLElement).style.color=A.red}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color=active?A.t2:A.t3}}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3.2 3.2 8.8 8.8M8.8 3.2 3.2 8.8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        })}
        <button type="button" onClick={()=>setShowBrandModal(true)} title="새 폼 만들기"
          style={{width:34,height:34,marginLeft:6,border:`1.5px dashed ${edge}`,borderRadius:10,background:"transparent",color:A.t3,fontSize:17,lineHeight:1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          +
        </button>
      </div>
    </div>
  }

  // ─────────────────────────────────────────────────────────────────────
  // ── VIEW: LOGIN ──────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────
  if(view==="login") {
    const bg=adminDark?"#0F1117":"#F7F8FA"
    const card=adminDark?"#1A1D23":"#FFFFFF"
    const border=adminDark?"rgba(255,255,255,0.08)":"#E5E8EB"
    const t1=adminDark?"#F3F4F6":"#191919"
    const t2=adminDark?"#9CA3AF":"#6B7280"
    const t3=adminDark?"rgba(255,255,255,0.25)":"#B0B8C1"
    return (
      <div style={{width,height,display:"flex",alignItems:"center",justifyContent:"center",background:bg,fontFamily:FONT,position:"relative" as const,WebkitFontSmoothing:"antialiased"}}>
        <button onClick={()=>setAdminDark(d=>!d)} style={{position:"absolute",top:16,right:16,height:30,padding:"0 12px",borderRadius:6,border:`1px solid ${border}`,background:"transparent",color:t2,fontFamily:FONT,fontSize:12,fontWeight:500,cursor:"pointer"}}>
          {adminDark
            ?<><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5 3.4 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> 라이트</>
            :<><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><path d="M13.5 8.5A5.5 5.5 0 0 1 7 2a6 6 0 1 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> 다크</>}
        </button>
        <div style={{width:380,padding:40,background:card,border:`1px solid ${border}`,borderRadius:16,boxShadow:adminDark?"0 8px 32px rgba(0,0,0,0.5)":"0 4px 24px rgba(0,0,0,0.08)"}}>
          <div style={{textAlign:"center" as const,marginBottom:32}}>
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:12,marginBottom:20}}>
              <FlickMark size={40}/>
              <FlickWordmark size={26} dark={adminDark}/>
            </div>
            <div style={{fontSize:13,color:t2}}>관리자 계정으로 로그인하세요</div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:t2,marginBottom:5}}>이메일</div>
            <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="admin@example.com"
              style={{width:"100%",background:adminDark?"#21252C":"#F7F8FA",border:`1.5px solid ${border}`,borderRadius:8,color:t1,fontFamily:FONT,fontSize:13.5,padding:"10px 12px",outline:"none",boxSizing:"border-box" as const}}/>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:600,color:t2,marginBottom:5}}>비밀번호</div>
            <input type="password" value={loginPw} onChange={e=>setLoginPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="••••••••"
              style={{width:"100%",background:adminDark?"#21252C":"#F7F8FA",border:`1.5px solid ${border}`,borderRadius:8,color:t1,fontFamily:FONT,fontSize:13.5,padding:"10px 12px",outline:"none",boxSizing:"border-box" as const}}/>
          </div>
          {loginErr&&<div style={{fontSize:12.5,color:"#E85C5C",marginBottom:14,padding:"9px 12px",borderRadius:8,background:"rgba(232,92,92,0.08)",border:"1px solid rgba(232,92,92,0.18)"}}>{loginErr}</div>}
          <button onClick={doLogin} disabled={loginLoading}
            style={{width:"100%",height:46,borderRadius:10,border:"none",background:loginLoading?"rgba(49,130,246,0.6)":"#3182F6",color:"#fff",fontFamily:FONT,fontSize:14.5,fontWeight:700,cursor:loginLoading?"not-allowed":"pointer",letterSpacing:"-0.2px"}}>
            {loginLoading?"로그인 중...":"로그인"}
          </button>
          {!supabaseUrl&&<div style={{marginTop:18,fontSize:11.5,color:t3,textAlign:"center" as const,lineHeight:1.6}}>환경변수에 Supabase URL과 Key를 먼저 입력해주세요</div>}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────
  // ── VIEW: DASHBOARD ──────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────
  if(view==="dashboard") {
    const BRANDS=[
      {id:"SNIPERFACTORY" as const,label:"스나이퍼팩토리",color:"#529DFF",sub:snList},
      {id:"INSIDEOUT" as const,label:"인사이드아웃",color:"#E85C5C",sub:ioList},
      {id:"SFACSPACE" as const,label:"스팩스페이스",color:"#073B70",sub:sfacList},
    ]
    return (
      <div style={{width,height,display:"flex",flexDirection:"column" as const,background:A.bg,fontFamily:FONT,overflow:"hidden",position:"relative" as const,WebkitFontSmoothing:"antialiased"}}>
        {renderEditorTabsStrip()}
        {/* Topbar */}
        <div style={{height:58,background:A.card,borderBottom:`1px solid ${A.border}`,display:"flex",alignItems:"center",padding:"0 20px",gap:10,flexShrink:0}}>
          <FlickMark size={30}/>
          <FlickWordmark size={17} dark={adminDark}/>
          <span style={{marginLeft:6,padding:"3px 8px",borderRadius:6,background:A.card2,fontSize:11,fontWeight:600,color:A.t3,whiteSpace:"nowrap" as const}}>운영 콘솔</span>
          <div style={{flex:1}}/>
          <div style={{display:"flex",alignItems:"center",gap:8,height:32,padding:"0 4px 0 10px",borderRadius:8,background:adminDark?A.card2:"#F8F9FB",flexShrink:0}}>
            <span style={{fontSize:12.5,color:A.t2,whiteSpace:"nowrap" as const}}>{authUser?.email}</span>
            <button onClick={doLogout} style={{height:24,padding:"0 8px",borderRadius:6,border:"none",background:A.card,color:A.t3,cursor:"pointer",fontFamily:FONT,fontSize:11.5,fontWeight:600}}>로그아웃</button>
          </div>
          <button onClick={()=>setShowBrandModal(true)}
            style={{height:34,padding:"0 14px",borderRadius:8,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:600,boxShadow:"0 1px 2px rgba(49,130,246,.35)",cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            새 폼 만들기
          </button>
        </div>
        {(()=>{
          const programOf=(item:any)=>progs.find(p=>p.id===item.config?.header?.programId)
          const typeOf=(item:any):DashboardFormType=>item.config?.dashboard?.formTypeTag||legacyDashboardFormType(item.config?.formType)
          const statusOf=(item:any):DashboardManualStatus=>{
            const dashboard=item.config?.dashboard||{}
            const dbPeriod=recruitmentPeriodOf(programOf(item),recruitmentPeriodModeOf(item.config))
            const operation=operationStatusOfDashboard(dashboard,dbPeriod)
            if(dashboard.isPublished===false&&!operation.hasOperationPeriod)return"draft"
            if(operation.hasOperationPeriod)return operation.status
            if(dashboard.alwaysOpen===undefined&&dashboard.manualStatus)return dashboard.manualStatus
            return"draft"
          }
          const statusInfo=(status:DashboardManualStatus)=>{
            if(status==="active")return{label:"진행중",color:adminDark?A.green:"#0F8A47",bg:adminDark?"rgba(34,197,94,0.14)":"#E7F6EE"}
            if(status==="closed")return{label:"종료",color:adminDark?A.t2:"#6B7280",bg:A.card2}
            return{label:"작성중",color:adminDark?"#A78BFA":"#6D4AEA",bg:adminDark?"rgba(139,92,246,0.16)":"#F0EDFE"}
          }
          const typeLabel=(type:DashboardFormType)=>DASHBOARD_FORM_TYPES.find(x=>x.value===type)?.label||"기타"
          const brandOf=(item:any)=>canonicalBrand(item.config?.brand||item.brand||"")
          const categoryNameOf=(prog?:Prog)=>cats.find(c=>c.id===prog?.category)?.name||"기타"
          const sidebarItems=saved.filter((item:any)=>!dashBrandFilter||brandOf(item)===dashBrandFilter)
          const sidebarProgramIds=new Set(sidebarItems.map((item:any)=>item.config?.header?.programId).filter(Boolean))
          const sidebarPrograms=progs.filter(program=>sidebarProgramIds.has(program.id))
          // 교육과정 탭은 Supabase `categories` 테이블을 그대로 따라간다.
          // 행이 추가되면 코드 수정 없이 해당 브랜드 탭에 바로 나타난다.
          const defaultProgramGroups=cats.reduce((acc:string[],cat)=>{
            const name=String(cat.name||"").trim()
            if(!name)return acc
            if(dashBrandFilter&&canonicalBrand(cat.brand||"")!==dashBrandFilter)return acc
            if(!acc.includes(name))acc.push(name)
            return acc
          },[])
          const groupCount=(group:string)=>sidebarItems.filter((item:any)=>categoryNameOf(programOf(item))===group).length
          // 테이블에 없는 카테고리를 쓰는 폼이 있으면 그 탭도 잃지 않도록 뒤에 덧붙인다.
          const allProgramGroups=sidebarPrograms.reduce((acc:string[],program)=>{
            const key=categoryNameOf(program)
            if(!acc.includes(key))acc.push(key)
            return acc
          },[...defaultProgramGroups])
          // 최근 작업(브랜드 미선택)에서는 카테고리가 모두 모여 길어지므로 폼이 있는 것을 앞으로 보낸다.
          // 브랜드를 고르면 테이블 순서를 그대로 쓴다. (sort는 안정 정렬이라 같은 그룹 안에서는 이름순 유지)
          const visibleProgramGroups=dashBrandFilter
            ?allProgramGroups
            :[...allProgramGroups].sort((a,b)=>(groupCount(a)?0:1)-(groupCount(b)?0:1))
          // 폼이 하나도 없는 카테고리는 기본으로 접어 탭바가 가로로 길어지지 않게 한다.
          // 현재 선택된 탭은 0개여도 계속 보여준다.
          const collapsedProgramGroups=visibleProgramGroups.filter(group=>groupCount(group)===0&&group!==dashProgramGroupFilter)
          const shownProgramGroups=dashShowEmptyGroups
            ?visibleProgramGroups
            :visibleProgramGroups.filter(group=>!collapsedProgramGroups.includes(group))
          const programGroups=sidebarPrograms.reduce((acc:Record<string,Prog[]>,program)=>{
            const key=categoryNameOf(program)
            ;(acc[key]||(acc[key]=[])).push(program)
            return acc
          },Object.fromEntries(visibleProgramGroups.map(group=>[group,[]])) as Record<string,Prog[]>)
          const selectedGroupPrograms=dashProgramGroupFilter?(programGroups[dashProgramGroupFilter]||[]):[]
          const filtered=saved.filter((item:any)=>{
            const type=typeOf(item)
            const status=statusOf(item)
            const program=programOf(item)
            const programGroup=categoryNameOf(program)
            const query=dashQuery.trim().toLowerCase()
            return(!dashBrandFilter||brandOf(item)===dashBrandFilter)
              &&(!dashProgramGroupFilter||programGroup===dashProgramGroupFilter)
              &&(!dashProgramFilter||item.config?.header?.programId===dashProgramFilter)
              &&(!dashTopTypeFilter||type===dashTopTypeFilter)
              &&(!dashTopStatusFilter||status===dashTopStatusFilter)
              &&(!query||`${item.name||""} ${item.config?.header?.title||""} ${program?.title||""}`.toLowerCase().includes(query))
          })
          if(!dashBrandFilter){
            const recentRank=(item:any)=>{
              const idx=recentEditIds.indexOf(String(item?.id||""))
              return idx<0?Number.MAX_SAFE_INTEGER:idx
            }
            filtered.sort((a:any,b:any)=>{
              const ra=recentRank(a),rb=recentRank(b)
              if(ra!==rb)return ra-rb
              return new Date(b.updated_at||b.created_at||0).getTime()-new Date(a.updated_at||a.created_at||0).getTime()
            })
          }
          const maxResponseCount=Math.max(1,...filtered.map((item:any)=>dashResponseCounts[item.id]||0))
          const brandCounts=BRANDS.map(brand=>({
            ...brand,
            count:saved.filter((item:any)=>brandOf(item)===brand.id).length,
          }))
          const tableColumns="minmax(240px,1.4fr) minmax(150px,0.9fr) 84px 82px 78px 92px 128px"
          const sideButton=(active:boolean):React.CSSProperties=>({width:"100%",height:32,padding:"0 8px",borderRadius:A.r,border:"none",background:active?A.blue2:"transparent",color:active?A.blue:A.t2,fontFamily:FONT,fontSize:12.5,fontWeight:active?600:500,cursor:"pointer",display:"flex",alignItems:"center",gap:8,textAlign:"left" as const})
          const sidebarToolButton=(color:string=A.t2):React.CSSProperties=>({width:"100%",height:32,padding:"0 8px",borderRadius:A.r,border:"none",background:"transparent",color,fontFamily:FONT,fontSize:12.5,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:8,textAlign:"left" as const})
          const openGuide=()=>{
            setShowGuide(true)
            if(!supa)return
            setGuideLoading(true)
            supa.from("guide_content").select("content").eq("key","form_admin").single()
              .then(({data})=>{if(data?.content)setGuideData(data.content as any);setGuideLoading(false)},()=>setGuideLoading(false))
          }
          return <div style={{flex:1,minHeight:0,display:"flex",overflow:"hidden"}}>
            <aside style={{width:208,flexShrink:0,background:A.bg,display:"flex",flexDirection:"column" as const,minHeight:0}}>
              <div style={{flex:1,minHeight:0,overflowY:"auto" as const,padding:"16px 12px",display:"flex",flexDirection:"column" as const,gap:26}}>
                <div>
                  <button onClick={()=>{setDashBrandFilter("");setDashProgramGroupFilter("");setDashProgramFilter("")}} style={{...sideButton(!dashBrandFilter),justifyContent:"space-between"}}>
                    <span style={{display:"flex",alignItems:"center",gap:8}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7"/><path d="M12 7.5V12l3 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      최근 작업
                    </span>
                    <span style={{fontSize:11.5,fontWeight:500,color:A.t3}}>{saved.length}</span>
                  </button>
                </div>
                <div>
                  <div style={{padding:"0 8px 7px",fontSize:11,fontWeight:700,letterSpacing:".4px",color:A.t3}}>브랜드</div>
                  {brandCounts.map(brand=><button key={brand.id} onClick={()=>{setDashBrandFilter(brand.id);setDashProgramGroupFilter("");setDashProgramFilter("")}} style={{...sideButton(dashBrandFilter===brand.id),justifyContent:"space-between"}}>
                    <span style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                      <span style={{width:6,height:6,borderRadius:3,background:brand.color,flexShrink:0}}/>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{brand.label}</span>
                    </span>
                    <span style={{fontSize:11.5,fontWeight:500,color:A.t3}}>{brand.count}</span>
                  </button>)}
                </div>
              </div>
              <div style={{padding:"12px",boxShadow:`inset 0 1px 0 ${adminDark?A.border:"#E7EAEF"}`,display:"flex",flexDirection:"column" as const,gap:2,flexShrink:0}}>
                <button onClick={()=>setAdminDark(d=>!d)} style={sidebarToolButton()}>
                  {adminDark
                    ? <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5 3.4 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> 라이트 모드</>
                    : <><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><path d="M13.5 8.5A5.5 5.5 0 0 1 7 2a6 6 0 1 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> 다크 모드</>}
                </button>
                <button onClick={()=>setFormTrashOpen(true)} style={sidebarToolButton(A.red)}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><path d="M2 4h12M6 4V2.8h4V4M5 6v8M8 6v8M11 6v8M4 4l.6 10h6.8L12 4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{flex:1}}>폼 휴지통</span>
                  {formTrashItems.length>0&&<span style={{fontSize:11.5,color:A.red}}>{formTrashItems.length}</span>}
                </button>
                <button onClick={openGuide} style={sidebarToolButton()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 16v-4M12 8.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  가이드
                </button>
              </div>
            </aside>
            <main style={{flex:1,minWidth:0,overflow:"hidden",padding:0,display:"flex",flexDirection:"column" as const,background:A.card}}>
              <div style={{position:"relative" as const,flexShrink:0,boxShadow:`inset 0 -1px 0 ${A.border}`}}>
              <style>{`.cf-course-tabs{scrollbar-width:none;-ms-overflow-style:none}.cf-course-tabs::-webkit-scrollbar{display:none;width:0;height:0}`}</style>
              <div ref={courseTabsRef} onScroll={syncCourseTabsArrows} className="cf-course-tabs" style={{display:"flex",alignItems:"center",gap:22,padding:"0 24px",overflowX:"auto" as const}}>
                <button onClick={()=>{setDashProgramGroupFilter("");setDashProgramFilter("")}}
                  style={{height:44,padding:"0 2px",border:"none",borderRadius:0,background:"transparent",color:!dashProgramGroupFilter?A.t1:A.t3,fontFamily:FONT,fontSize:13.5,fontWeight:!dashProgramGroupFilter?700:500,cursor:"pointer",whiteSpace:"nowrap" as const,display:"flex",alignItems:"center",gap:7,boxShadow:!dashProgramGroupFilter?`inset 0 -2px 0 ${A.blue}`:"none"}}>
                  <span>전체 교육과정</span>
                  <span style={{padding:"1px 6px",borderRadius:5,fontSize:11.5,fontWeight:600,background:!dashProgramGroupFilter?A.blue2:A.card2,color:!dashProgramGroupFilter?A.blue:A.t3}}>{sidebarItems.length}</span>
                </button>
                {shownProgramGroups.map(group=>{
                  const active=dashProgramGroupFilter===group
                  return <button key={group} onClick={()=>{setDashProgramGroupFilter(group);setDashProgramFilter("")}}
                    style={{height:44,padding:"0 2px",border:"none",borderRadius:0,background:"transparent",color:active?A.t1:A.t3,fontFamily:FONT,fontSize:13.5,fontWeight:active?700:500,cursor:"pointer",whiteSpace:"nowrap" as const,display:"flex",alignItems:"center",gap:7,boxShadow:active?`inset 0 -2px 0 ${A.blue}`:"none",opacity:groupCount(group)===0?0.55:1}}>
                    <span>{group}</span>
                    <span style={{padding:"1px 6px",borderRadius:5,fontSize:11.5,fontWeight:600,background:active?A.blue2:A.card2,color:active?A.blue:A.t3}}>{groupCount(group)}</span>
                  </button>
                })}
                {collapsedProgramGroups.length>0&&<button onClick={()=>setDashShowEmptyGroups(v=>!v)}
                  title={dashShowEmptyGroups?"폼이 없는 교육과정 접기":`폼이 없는 교육과정 ${collapsedProgramGroups.length}개 펼치기`}
                  style={{height:26,padding:"0 8px",border:"none",borderRadius:6,background:A.card2,color:A.t3,fontFamily:FONT,fontSize:11.5,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap" as const,display:"flex",alignItems:"center",gap:4,flexShrink:0,marginLeft:-12}}>
                  {dashShowEmptyGroups?"접기":`+${collapsedProgramGroups.length}`}
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{transform:dashShowEmptyGroups?"rotate(180deg)":"none",transition:"transform .15s"}}>
                    <path d="M2 3.5 5 6.5l3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>}
              </div>
              {(["left","right"] as const).map(side=>{
                const on=side==="left"?courseTabsArrows.left:courseTabsArrows.right
                if(!on)return null
                return <div key={side} style={{position:"absolute" as const,top:0,bottom:1,[side]:0,width:56,display:"flex",alignItems:"center",justifyContent:side==="left"?"flex-start":"flex-end",padding:side==="left"?"0 0 0 6px":"0 6px 0 0",pointerEvents:"none" as const,background:`linear-gradient(to ${side==="left"?"right":"left"}, ${A.card} 42%, ${A.card}00 100%)`}}>
                  <button onClick={()=>scrollCourseTabs(side==="left"?-1:1)} aria-label={side==="left"?"이전 교육과정 보기":"다음 교육과정 보기"}
                    style={{pointerEvents:"auto" as const,width:26,height:26,borderRadius:8,border:`1px solid ${A.border}`,background:A.card,color:A.t2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,boxShadow:"0 1px 3px rgba(16,24,40,.10)"}}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{transform:side==="left"?"rotate(90deg)":"rotate(-90deg)"}}>
                      <path d="M2 3.5 5 6.5l3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              })}
              </div>
              {dashProgramGroupFilter&&<div style={{flexShrink:0,display:"flex",alignItems:"center",gap:8,padding:"14px 24px 0"}}>
                <div style={{position:"relative" as const,flexShrink:0}}>
                  <PanelSelect value={dashProgramFilter} onChange={setDashProgramFilter} A={A} height={32} fontSize={12.5} fontWeight={600} radius={8} padX={11} width={232} maxWidth={320}
                    options={[{value:"",label:`${dashProgramGroupFilter} 전체 과정`},...[...selectedGroupPrograms].sort((a,b)=>a.title.localeCompare(b.title,"ko")).map(program=>({value:program.id,label:program.title}))]}/>
                </div>
                <button onClick={()=>{setDashProgramGroupFilter("");setDashProgramFilter("")}}
                  style={{height:32,padding:"0 10px",borderRadius:A.r,border:"none",background:"transparent",color:A.t3,fontFamily:FONT,fontSize:12.5,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
                  초기화
                </button>
              </div>}
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"20px 24px 26px",flexShrink:0}}>
                <div>
                  <div style={{display:"flex",alignItems:"baseline",gap:7}}>
                    <span style={{fontSize:17,fontWeight:700,letterSpacing:"-.2px",color:A.t1}}>{dashBrandFilter?brandDisplayName(dashBrandFilter):"전체"} 폼</span>
                    <span style={{fontSize:13,fontWeight:600,color:A.t3}}>{filtered.length}</span>
                  </div>
                  <div style={{fontSize:12,color:A.t3,marginTop:3}}>필요한 폼을 빠르게 찾고 응답 현황을 확인할 수 있어요.</div>
                </div>
                <div style={{flex:1}}/>
                <div style={{position:"relative" as const,flexShrink:0}}>
                  <PanelSelect value={dashTopTypeFilter} onChange={v=>setDashTopTypeFilter(v as DashboardFormType|"")} A={A} height={34} fontSize={12.5} fontWeight={600} radius={8} padX={12} width={150}
                    options={[{value:"",label:"폼 유형 전체"},...DASHBOARD_FORM_TYPES.map(t=>({value:t.value,label:t.label}))]}/>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:2,padding:3,borderRadius:9,background:A.card2,flexShrink:0}}>
                  {[
                    {value:"" as const,label:"전체"},
                    {value:"draft" as const,label:"작성중"},
                    {value:"active" as const,label:"진행중"},
                    {value:"closed" as const,label:"종료"},
                  ].map(status=>{
                    const active=dashTopStatusFilter===status.value
                    return <button key={status.value||"all"} onClick={()=>setDashTopStatusFilter(status.value as DashboardManualStatus|"")}
                      style={{height:28,padding:"0 11px",border:"none",borderRadius:7,background:active?A.card:"transparent",color:active?A.blue:A.t2,fontFamily:FONT,fontSize:12.5,fontWeight:active?600:500,cursor:"pointer",boxShadow:active?"0 1px 2px rgba(16,24,40,.10)":"none",whiteSpace:"nowrap" as const}}>
                      {status.label}
                    </button>
                  })}
                </div>
                <div style={{flex:"0 1 250px",minWidth:150,height:34,display:"flex",alignItems:"center",gap:7,padding:"0 11px",borderRadius:A.r,border:"none",background:A.card2,flexShrink:0,transition:"box-shadow .12s, background .12s"}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{color:A.t3,flexShrink:0}}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  <input value={dashQuery} onChange={e=>setDashQuery(e.target.value)} placeholder="폼 이름 · 교육과정 검색"
                    onFocus={e=>{const w=e.currentTarget.parentElement as HTMLElement|null;if(w){w.style.background=A.card;w.style.boxShadow=`0 0 0 2px ${A.blue}40`}}}
                    onBlur={e=>{const w=e.currentTarget.parentElement as HTMLElement|null;if(w){w.style.background=A.card2;w.style.boxShadow="none"}}}
                    style={{width:"100%",border:"none",outline:"none",background:"transparent",color:A.t1,fontFamily:FONT,fontSize:12.5}}/>
                </div>
              </div>
              <div style={{flex:1,minHeight:0,background:A.card,overflow:"hidden"}}>
                <div ref={dashTableScrollRef} onScroll={onDashboardTableScroll} style={{height:"100%",overflow:"auto"}}>
                <div style={{display:"grid",gridTemplateColumns:tableColumns,alignItems:"center",gap:12,minWidth:940,padding:"0 24px 8px",boxShadow:`inset 0 -1px 0 ${adminDark?A.border:"#EFF1F4"}`,background:A.card,fontSize:11.5,fontWeight:600,color:A.t3,position:"sticky" as const,top:0,zIndex:4}}>
                    <span>폼 이름</span><span>교육과정</span><span>폼 유형</span><span>상태</span><span>응답 수</span><span>수정일</span><span style={{textAlign:"right"}}>액션</span>
                  </div>
                  <div style={{minWidth:940,padding:"0 0 10px"}}>
                  {dashLoading?<div style={{padding:"8px 24px"}}>{[1,2,3,4,5].map(i=><div key={i} style={{height:48,borderRadius:A.r,background:A.card2,marginBottom:8,animation:"skeletonPulse 1.4s ease-in-out infinite"}}/>)}</div>
                  :filtered.length===0?<div style={{padding:"72px 20px",textAlign:"center" as const}}>
                    <div style={{fontSize:13.5,fontWeight:600,color:A.t2}}>조건에 맞는 폼이 없어요.</div>
                    <div style={{fontSize:12.5,color:A.t3,marginTop:5}}>필터를 초기화하거나 검색어를 지워보세요.</div>
                  </div>
                  :filtered.map((item:any)=>{
                    const type=typeOf(item)
                    const status=statusInfo(statusOf(item))
                    const program=programOf(item)
                    const locked=!!item.config?.dashboard?.editPasswordHash
                    const responseCount=dashResponseCounts[item.id]||0
                    const responsePct=responseCount?Math.max(8,Math.round((responseCount/maxResponseCount)*100)):0
                    return <div key={item.id} onMouseEnter={e=>{prefetchFullFormRow(item);(e.currentTarget as HTMLElement).style.background=adminDark?A.card2:"#F7F9FC"}} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=A.card} onContextMenu={e=>{e.preventDefault();setCtxMenu({x:e.clientX,y:e.clientY,item,source:"dashboard"})}}
                      style={{display:"grid",gridTemplateColumns:tableColumns,alignItems:"center",gap:12,minHeight:48,padding:"0 24px",fontSize:12.5,color:A.t2,transition:"background .12s"}}>
                      <div style={{minWidth:0,paddingRight:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:5,minWidth:0}}>
                          <span style={{fontSize:13,fontWeight:600,color:A.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{item.name||"이름 없는 폼"}</span>
                          {locked&&<span title="편집 비밀번호 설정됨" style={{color:A.t3,display:"inline-flex",alignItems:"center",flexShrink:0}}><LockIcon/></span>}
                        </div>
                      </div>
                      <span style={{color:program?.title?A.t2:A.t4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{program?.title||"교육과정 없음"}</span>
                      <span style={{color:A.t2}}>{typeLabel(type)}</span>
                      <span><span style={{display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:6,background:status.bg,color:status.color,fontSize:11.5,fontWeight:600}}>
                        {status.label}
                      </span></span>
                      <div style={{display:"flex",flexDirection:"column" as const,alignItems:"flex-start",gap:4,minWidth:0}}>
                        <span style={{fontSize:13,fontWeight:responseCount?700:500,color:responseCount?A.t1:A.t4,fontVariantNumeric:"tabular-nums" as const}}>{responseCount}</span>
                        <span style={{width:48,height:3,borderRadius:2,background:adminDark?A.card2:"#EFF1F4",overflow:"hidden",display:"block"}}>
                          <span style={{display:"block",width:`${responsePct}%`,height:"100%",borderRadius:999,background:A.blue}}/>
                        </span>
                      </div>
                      <span style={{fontSize:12.5,color:A.t3,fontVariantNumeric:"tabular-nums" as const}}>{item.updated_at?new Date(item.updated_at).toLocaleDateString("ko-KR"):"-"}</span>
                      <div style={{display:"flex",justifyContent:"flex-end",gap:4}}>
                        <button onClick={()=>openFormAnalytics(item)} title="응답 및 분석" style={{width:28,height:28,borderRadius:7,border:"none",background:"transparent",color:A.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 20V11M10 20V4M16 20v-6M22 20H2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg></button>
                        <button onClick={()=>openDashboardSettings(item)} title="폼 설정" style={{width:28,height:28,borderRadius:7,border:"none",background:"transparent",color:A.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><GearIcon size={14}/></button>
                        <button onPointerDown={()=>prefetchFullFormRow(item,true)} onFocus={()=>prefetchFullFormRow(item,true)} onClick={()=>requestOpenFormForEdit(item)} title="편집" style={{height:28,padding:"0 11px",borderRadius:7,border:`1px solid ${adminDark?A.border:"#E3E7EC"}`,background:A.card,color:A.t2,cursor:"pointer",fontFamily:FONT,fontSize:12,fontWeight:600}}>편집</button>
                      </div>
                    </div>
                  })}
                  {!dashLoading&&dashLoadingMore&&<div style={{height:48,display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:A.t3,fontSize:12.5,borderTop:`1px solid ${A.border}`}}>
                    <span style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${A.border}`,borderTopColor:A.blue,animation:"actionSpin .8s linear infinite"}}/>
                    추가 폼을 불러오는 중이에요.
                  </div>}
                  {!dashLoading&&!dashLoadingMore&&!dashHasMore&&filtered.length>0&&<div style={{height:42,display:"flex",alignItems:"center",justifyContent:"center",color:A.t3,fontSize:12,borderTop:`1px solid ${A.border}`}}>모든 폼을 불러왔어요.</div>}
                  </div>
                </div>
              </div>
              <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:8,padding:"11px 24px",background:adminDark?A.card2:"#FAFBFC",fontSize:11.5,color:A.t3}}>
                <span>{(()=>{const c=(st:DashboardManualStatus)=>filtered.filter((item:any)=>statusOf(item)===st).length
                  return `총 ${filtered.length}개 · 진행중 ${c("active")} · 작성중 ${c("draft")} · 종료 ${c("closed")}`})()}</span>
                <div style={{flex:1}}/>
                <span>우클릭으로 폼 복사 · 이름 변경 · 휴지통 이동</span>
              </div>
            </main>
          </div>
        })()}
        {dashboardSettings&&(()=>{
          const program=progs.find(p=>p.id===dashboardSettings.item.config?.header?.programId)
          const recruitmentMode=recruitmentPeriodModeOf(dashboardSettings.item.config)
          const recruitment=recruitmentPeriodOf(program,recruitmentMode)
          const hasRecruitmentPeriod=!!(recruitment.start||recruitment.end)
          return <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setDashboardSettings(null)}>
            <div style={{width:500,maxWidth:"92vw",maxHeight:"88vh",overflowY:"auto" as const,padding:24,borderRadius:16,background:A.card,border:`1px solid ${A.border}`,boxShadow:A.shadow}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:17,fontWeight:700,color:A.t1,marginBottom:5,letterSpacing:"-.2px"}}>폼 설정</div>
              <div style={{fontSize:12.5,color:A.t3,marginBottom:20}}>폼 제목, 브랜드, 폼 유형과 운영 기준을 정합니다.</div>
              <div style={{fontSize:12.5,fontWeight:700,color:A.t2,marginBottom:8}}>폼 제목</div>
              <input value={dashboardSettings.formName} onChange={e=>setDashboardSettings(prev=>prev&&({...prev,formName:e.target.value}))} placeholder="폼 제목" style={{width:"100%",height:38,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t1,fontFamily:FONT,fontSize:13,marginBottom:16,boxSizing:"border-box" as const}}/>
              <div style={{fontSize:12.5,fontWeight:700,color:A.t2,marginBottom:8}}>브랜드</div>
              <div style={{marginBottom:16}}><PanelSelect value={dashboardSettings.brand} onChange={v=>setDashboardSettings(prev=>prev&&({...prev,brand:v as BrandId}))} A={A} height={38} options={[{value:"SNIPERFACTORY",label:"스나이퍼팩토리"},{value:"INSIDEOUT",label:"인사이드아웃"},{value:"SFACSPACE",label:"스팩스페이스"}]}/></div>
              <div style={{fontSize:12.5,fontWeight:700,color:A.t2,marginBottom:8}}>폼 유형</div>
              <div style={{marginBottom:16}}><PanelSelect value={dashboardSettings.formTypeTag} onChange={v=>setDashboardSettings(prev=>prev&&({...prev,formTypeTag:v as DashboardFormType}))} A={A} height={38} options={DASHBOARD_FORM_TYPES.map(t=>({value:t.value,label:t.label}))}/></div>
              <div style={{fontSize:12.5,fontWeight:700,color:A.t2,marginBottom:8}}>편집 비밀번호</div>
              {!!dashboardSettings.item.config?.dashboard?.editPasswordHash&&!canMasterReset(authRole)&&<input type="password" value={dashboardSettings.currentEditPasswordDraft} onChange={e=>setDashboardSettings(prev=>prev&&({...prev,currentEditPasswordDraft:e.target.value}))} placeholder="변경 또는 해제 시 현재 비밀번호" style={{width:"100%",height:38,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t1,fontFamily:FONT,fontSize:13,marginBottom:8,boxSizing:"border-box" as const}}/>}
              <input type="password" value={dashboardSettings.editPasswordDraft} disabled={dashboardSettings.clearEditPassword} onChange={e=>setDashboardSettings(prev=>prev&&({...prev,editPasswordDraft:e.target.value}))} placeholder={dashboardSettings.item.config?.dashboard?.editPasswordHash?"새 비밀번호 입력 시 변경":"비밀번호 입력 시 편집 보호"} style={{width:"100%",height:38,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t1,fontFamily:FONT,fontSize:13,boxSizing:"border-box" as const,opacity:dashboardSettings.clearEditPassword?.55:1}}/>
              <div style={{fontSize:11.5,color:A.t3,lineHeight:1.55,margin:"6px 0 9px"}}>{canMasterReset(authRole)&&dashboardSettings.item.config?.dashboard?.editPasswordHash?"master 권한 계정은 현재 비밀번호 없이 편집 비밀번호를 변경하거나 해제할 수 있어요.":"설정하면 대시보드에서 편집을 열 때 비밀번호를 확인합니다. 원문 대신 해시값만 저장됩니다."}</div>
              {!!dashboardSettings.item.config?.dashboard?.editPasswordHash&&<label style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,color:A.t2,cursor:"pointer",marginBottom:16}}><input type="checkbox" checked={dashboardSettings.clearEditPassword} onChange={e=>setDashboardSettings(prev=>prev&&({...prev,clearEditPassword:e.target.checked,editPasswordDraft:e.target.checked?"":prev.editPasswordDraft}))}/>편집 비밀번호 해제</label>}
              {hasRecruitmentPeriod&&<div style={{padding:"11px 12px",marginBottom:16,borderRadius:A.r,background:A.blue2,border:`1px solid ${A.blue}33`,fontSize:12.5,color:A.blue,lineHeight:1.6}}>프로그램 DB의 {recruitmentPeriodLabel(recruitmentMode)}을 기본 운영 기간으로 불러왔어요.<br/>필요하면 아래에서 기간을 추가하거나 수정할 수 있습니다.<br/>{recruitmentPeriodText(recruitment,"기간 데이터 없음")}</div>}
              <div style={{fontSize:12,fontWeight:600,color:A.t3,marginBottom:9}}>폼 운영 기간</div>
              <label style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,color:A.t2,cursor:"pointer",marginBottom:8}}>
                <input type="checkbox" checked={dashboardSettings.alwaysOpen} onChange={e=>setDashboardSettings(prev=>prev&&({...prev,alwaysOpen:e.target.checked,manualStatus:""}))}/>
                상시 운영
              </label>
              <div style={{fontSize:11.5,color:A.t3,lineHeight:1.5,marginBottom:9}}>체크하면 기간과 관계없이 진행중으로 표시됩니다. 체크를 꺼도 설정해둔 기간은 유지됩니다.</div>
              <div style={{marginBottom:16}}>
                <OperationPeriodsEditor periods={dashboardSettings.operationPeriods} disabled={dashboardSettings.alwaysOpen} A={A} onChange={operationPeriods=>setDashboardSettings(prev=>{
                  if(!prev)return prev
                  const primary=primaryOperationRange(operationPeriods)
                  return{...prev,operationPeriods,operationStart:primary.start,operationEnd:primary.end}
                })}/>
              </div>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
                <button onClick={()=>setDashboardSettings(null)} style={{height:38,padding:"0 14px",borderRadius:A.r,border:`1px solid ${A.border}`,background:"transparent",color:A.t2,fontFamily:FONT,fontSize:13,cursor:"pointer"}}>취소</button>
                <button onClick={saveDashboardSettings} disabled={dashboardSettingsSaving} style={{height:38,padding:"0 16px",borderRadius:A.r,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:700,cursor:"pointer"}}>{dashboardSettingsSaving?"저장 중...":"저장"}</button>
              </div>
            </div>
          </div>
        })()}
        {editPasswordPrompt&&(
          <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1001}} onClick={()=>!editPasswordPrompt.checking&&setEditPasswordPrompt(null)}>
            <div style={{width:360,padding:24,borderRadius:16,background:A.card,border:`1px solid ${A.border}`,boxShadow:A.shadow}} onClick={e=>e.stopPropagation()}>
              <div style={{width:40,height:40,borderRadius:A.r,background:A.blue2,color:A.blue,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
                <svg width="19" height="19" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7V5a3 3 0 0 1 6 0v2M8 10v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              </div>
              <div style={{fontSize:17,fontWeight:700,color:A.t1,marginBottom:5,letterSpacing:"-.2px"}}>편집 비밀번호 확인</div>
              <div style={{fontSize:12.5,color:A.t3,lineHeight:1.55,marginBottom:15}}>이 폼은 편집 보호가 설정되어 있어요.</div>
              <input autoFocus type="password" value={editPasswordPrompt.password} onChange={e=>setEditPasswordPrompt(prev=>prev&&({...prev,password:e.target.value,error:""}))} onKeyDown={e=>e.key==="Enter"&&verifyEditPassword()} placeholder="비밀번호 입력" style={{width:"100%",height:40,padding:"0 11px",borderRadius:A.r,border:`1px solid ${editPasswordPrompt.error?A.red:A.border}`,background:A.card2,color:A.t1,fontFamily:FONT,fontSize:13,boxSizing:"border-box" as const,outline:"none"}}/>
              {editPasswordPrompt.error&&<div style={{fontSize:12,color:A.red,marginTop:7}}>{editPasswordPrompt.error}</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginTop:18}}>
                <button onClick={()=>canMasterReset(authRole)?resetEditPasswordFromPrompt():setEditPasswordPrompt(prev=>prev&&({...prev,error:"비밀번호 원문은 복구할 수 없어요. master 권한 계정으로 비밀번호를 초기화해주세요."}))} disabled={editPasswordPrompt.checking} style={{height:38,padding:"0 4px",border:"none",background:"transparent",color:A.t3,fontFamily:FONT,fontSize:12.5,cursor:"pointer"}}>{canMasterReset(authRole)?"비밀번호 초기화":"비밀번호 찾기"}</button>
                <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setEditPasswordPrompt(null)} disabled={editPasswordPrompt.checking} style={{height:38,padding:"0 14px",borderRadius:A.r,border:`1px solid ${A.border}`,background:"transparent",color:A.t2,fontFamily:FONT,fontSize:13,cursor:"pointer"}}>취소</button>
                <button onClick={verifyEditPassword} disabled={editPasswordPrompt.checking} style={{height:38,padding:"0 16px",borderRadius:A.r,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:700,cursor:"pointer"}}>{editPasswordPrompt.checking?"확인 중...":"편집 열기"}</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {formTrashOpen&&(
          <div style={{position:"absolute" as const,inset:0,background:"rgba(21,24,29,.42)",display:"flex",alignItems:"center",justifyContent:"center",padding:40,zIndex:1000}} onClick={()=>!formTrashBusy&&setFormTrashOpen(false)}>
            <div style={{width:"100%",maxWidth:560,maxHeight:"100%",background:A.card,border:adminDark?`1px solid ${A.border}`:"none",borderRadius:16,boxShadow:"0 24px 64px -12px rgba(16,24,40,.45)",display:"flex",flexDirection:"column" as const,overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
              <div style={{flexShrink:0,display:"flex",alignItems:"flex-start",gap:12,padding:"22px 22px 16px"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:17,fontWeight:700,color:A.t1,letterSpacing:"-.2px"}}>폼 휴지통</div>
                  <div style={{fontSize:12.5,color:A.t3,marginTop:4}}>영구 삭제하기 전까지 보관되며 언제든 복구할 수 있어요.</div>
                </div>
                <button onClick={()=>setFormTrashOpen(false)} disabled={!!formTrashBusy}
                  style={{width:32,height:32,flexShrink:0,border:"none",borderRadius:A.r,background:"transparent",color:A.t3,cursor:formTrashBusy?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
                  onMouseEnter={e=>{if(!formTrashBusy){(e.currentTarget as HTMLElement).style.background=A.card2;(e.currentTarget as HTMLElement).style.color=A.t2}}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color=A.t3}}>
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>
              </div>
              <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:8,padding:"0 22px 12px"}}>
                <span style={{fontSize:12,fontWeight:600,color:A.t3}}>{formTrashItems.length}개 항목</span>
                <div style={{flex:1}}/>
                {formTrashItems.length>0&&<button onClick={purgeAllFormsFromTrash} disabled={!!formTrashBusy}
                  style={{height:30,padding:"0 11px",border:"none",borderRadius:A.r,background:"transparent",color:A.t3,fontFamily:FONT,fontSize:12,fontWeight:600,cursor:formTrashBusy?"not-allowed":"pointer"}}
                  onMouseEnter={e=>{if(!formTrashBusy){(e.currentTarget as HTMLElement).style.background=adminDark?"rgba(240,107,107,0.14)":"#FDECEC";(e.currentTarget as HTMLElement).style.color=A.red}}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color=A.t3}}>
                  {formTrashBusy==="__all__"?"비우는 중...":"휴지통 비우기"}
                </button>}
              </div>
              <div style={{flex:1,minHeight:0,overflowY:"auto" as const,padding:"0 22px 8px"}}>
                {formTrashItems.length===0
                  ? <div style={{padding:"44px 12px",textAlign:"center" as const,color:A.t3,fontSize:13}}>폼 휴지통이 비어 있어요.</div>
                  : formTrashItems.map((item:any)=>{
                    const trashedAt=formTrashedAtOf(item)
                    const busy=formTrashBusy===item.id||formTrashBusy==="__all__"
                    const brand=BRANDS.find(b=>b.id===canonicalBrand(item.config?.brand||item.brand||""))
                    return <div key={item.id}
                      style={{display:"flex",alignItems:"center",gap:12,padding:"13px 4px",boxShadow:`inset 0 -1px 0 ${A.card2}`}}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=adminDark?A.card2:"#FAFBFC"}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13.5,fontWeight:600,color:A.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{item.name||"이름 없는 폼"}</div>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginTop:4}}>
                          <span style={{width:5,height:5,borderRadius:3,flexShrink:0,background:brand?.color||A.t4}}/>
                          <span style={{fontSize:11.5,color:A.t3}}>{brandDisplayName(item.config?.brand||item.brand||"")}</span>
                          {trashedAt&&<><span style={{fontSize:11.5,color:A.t4}}>·</span>
                          <span style={{fontSize:11.5,color:A.t3}}>{new Date(trashedAt).toLocaleString("ko-KR")}</span></>}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                        <button onClick={()=>restoreFormFromTrash(item)} disabled={busy}
                          style={{height:30,padding:"0 12px",border:"none",borderRadius:A.r,background:A.blue2,color:A.blue,fontFamily:FONT,fontSize:12.5,fontWeight:700,cursor:busy?"wait":"pointer"}}>
                          {formTrashBusy===item.id?"처리 중...":"복구"}
                        </button>
                        <button onClick={()=>purgeFormFromTrash(item)} disabled={busy}
                          style={{height:30,padding:"0 12px",border:"none",borderRadius:A.r,background:"transparent",color:A.t3,fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:busy?"wait":"pointer"}}
                          onMouseEnter={e=>{if(!busy){(e.currentTarget as HTMLElement).style.background=adminDark?"rgba(240,107,107,0.14)":"#FDECEC";(e.currentTarget as HTMLElement).style.color=A.red}}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color=A.t3}}>
                          영구 삭제
                        </button>
                      </div>
                    </div>
                  })}
              </div>
              <div style={{flexShrink:0,padding:"12px 22px",background:adminDark?A.card2:"#FAFBFC",fontSize:11.5,color:A.t3}}>영구 삭제한 폼은 응답과 QR · 분석 기록까지 함께 삭제되며 복구할 수 없어요.</div>
            </div>
          </div>
        )}
        {/* Brand modal */}
        {showBrandModal&&(
          <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setShowBrandModal(false)}>
            <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:16,padding:"28px 28px 24px",width:380,boxShadow:A.shadow,position:"relative" as const}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setShowBrandModal(false)} style={{position:"absolute",top:14,right:14,width:28,height:28,borderRadius:"50%",border:`1px solid ${A.border}`,background:A.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:A.t3,fontFamily:FONT,lineHeight:1}}>×</button>
              <div style={{fontSize:17,fontWeight:700,color:A.t1,marginBottom:22,letterSpacing:"-0.2px"}}>어떤 브랜드 폼을 만들까요?</div>
              <div style={{display:"flex",flexDirection:"column" as const,gap:12}}>
                <button onClick={()=>startNewForm("SNIPERFACTORY")}
                  style={{width:"100%",padding:"22px 28px",borderRadius:12,border:`1px solid ${A.border2}`,background:"transparent",cursor:"pointer",textAlign:"left" as const,fontFamily:FONT,transition:"all .15s"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card2;(e.currentTarget as HTMLElement).style.borderColor=A.border2}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.borderColor=A.border2}}>
                  <SFLogo height={22} dark={adminDark}/>
                </button>
                <button onClick={()=>startNewForm("INSIDEOUT")}
                  style={{width:"100%",padding:"22px 28px",borderRadius:12,border:`1px solid ${A.border2}`,background:"transparent",cursor:"pointer",textAlign:"left" as const,fontFamily:FONT,transition:"all .15s"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card2;(e.currentTarget as HTMLElement).style.borderColor=A.border2}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.borderColor=A.border2}}>
                  <IOLogo height={18} dark={adminDark}/>
                </button>
                <button onClick={()=>startNewForm("SFACSPACE")}
                  style={{width:"100%",padding:"22px 28px",borderRadius:12,border:`1px solid ${A.border2}`,background:"transparent",cursor:"pointer",textAlign:"left" as const,fontFamily:FONT,transition:"all .15s"}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card2;(e.currentTarget as HTMLElement).style.borderColor=A.border2}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.borderColor=A.border2}}>
                  <SfacspaceLogo height={18} dark={adminDark}/>
                </button>
              </div>
            </div>
          </div>
        )}
      {/* TEMPLATE MODAL */}
      {showTemplateModal&&(
        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={()=>{setShowTemplateModal(false);setPendingBrand(null)}}>
          <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:16,padding:"28px 24px",width:420,maxHeight:"85vh",overflowY:"auto" as const,boxShadow:A.shadow,position:"relative" as const,display:"flex",gap:24}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>{setShowTemplateModal(false);setPendingBrand(null)}} style={{position:"absolute",top:14,right:14,width:28,height:28,borderRadius:"50%",border:`1px solid ${A.border}`,background:A.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:A.t3,lineHeight:1}}>×</button>
            {/* 왼쪽: 기본 폼 종류 */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:18,fontWeight:700,color:A.t1,marginBottom:6,letterSpacing:"-0.2px"}}>어떤 형식의 폼을 만들까요?</div>
              <div style={{fontSize:13,color:A.t3,marginBottom:20}}>
                {brandDisplayName(pendingBrand||"")} 브랜드 폼
              </div>
              <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
              {[
                {id:"alert" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label:"사전 알림 신청폼", desc:"오픈 소식을 먼저 받아보고 싶은 분들을 위한 간단한 신청폼"},
                {id:"kdt" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="3" width="6" height="4" rx="1.5" stroke={A.t2} strokeWidth="1.8"/><line x1="9" y1="12" x2="15" y2="12" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round"/><line x1="9" y1="16" x2="13" y2="16" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round"/></svg>,
                  label:"교육과정 신청폼", desc:"교육과정 모집 응답을 받기 위한 신청 폼"},
                {id:"edu_biz" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4z" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label:"교육 사업 신청폼", desc:"기업 대상 교육 사업 신청을 받는 폼"},
                {id:"company" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label:"참여기업 프로그램 신청폼", desc:"참여 기업 모집 및 프로그램 신청을 받는 폼"},
                {id:"recruit" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label:"채용 폼", desc:"입사 지원자를 모집하는 채용 신청폼"},
                {id:"blank" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label:"빈 템플릿", desc:"아무것도 없이 처음부터 직접 만들어나가는 폼"},
              ].map(t=>(
                <button key={t.id} onClick={()=>applyTemplate(t.id)}
                  style={{width:"100%",padding:"14px 16px",borderRadius:A.r2,border:`1px solid ${A.border}`,background:"transparent",cursor:"pointer",textAlign:"left" as const,fontFamily:FONT,transition:"all .12s",display:"flex",alignItems:"flex-start",gap:14}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card2;(e.currentTarget as HTMLElement).style.borderColor=A.border2}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.borderColor=A.border}}>
                  <div style={{flexShrink:0,marginTop:1}}>{t.icon}</div>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:600,color:A.t1,marginBottom:3}}>{t.label}</div>
                    <div style={{fontSize:12,color:A.t3,lineHeight:1.5}}>{t.desc}</div>
                  </div>
                </button>
              ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* RENAME MODAL */}
      {renameModal&&<div style={{position:"fixed" as const,inset:0,zIndex:10000,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setRenameModal(null)}>
        <div style={{background:A.card,borderRadius:16,padding:"28px 24px",width:360,boxShadow:A.shadow}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:17,fontWeight:700,color:A.t1,marginBottom:6,letterSpacing:"-.2px"}}>폼 이름 변경</div>
          <div style={{fontSize:12.5,color:A.t3,marginBottom:18}}>새로운 폼 이름을 입력해주세요.</div>
          <div style={{fontSize:12.5,fontWeight:700,color:A.t2,marginBottom:8}}>폼 이름</div>
          <input value={renameName} onChange={e=>setRenameName(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&renameName.trim())renameCfg(renameModal.id,renameName)}}
            placeholder="폼 이름을 입력해주세요"
            autoFocus
            style={{width:"100%",background:A.card2,border:`1px solid ${A.border}`,borderRadius:A.r,color:A.t1,fontFamily:FONT,fontSize:13,padding:"9px 12px",outline:"none",boxSizing:"border-box" as const,marginBottom:16}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setRenameModal(null)}
              style={{flex:1,height:40,borderRadius:A.r,border:`1px solid ${A.border}`,background:"transparent",color:A.t2,fontFamily:FONT,fontSize:13,cursor:"pointer"}}>취소</button>
            <button onClick={()=>renameCfg(renameModal.id,renameName)}
              style={{flex:2,height:40,borderRadius:A.r,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:700,cursor:"pointer"}}>변경하기</button>
          </div>
        </div>
      </div>}
      {/* CONTEXT MENU */}
      {ctxMenu&&<>
        <div style={{position:"fixed" as const,inset:0,zIndex:9998}} onClick={()=>setCtxMenu(null)}/>
        <div style={{position:"fixed" as const,left:ctxMenu.x,top:ctxMenu.y,zIndex:9999,background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:4,boxShadow:A.shadow,minWidth:140}}>
          <button onClick={()=>{copyForm(ctxMenu.item);setCtxMenu(null)}}
            style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 12px",border:"none",background:"transparent",cursor:"pointer",color:A.t1,fontFamily:FONT,fontSize:13,borderRadius:A.r,textAlign:"left" as const}}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=A.card2}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            폼 복사
          </button>
          {ctxMenu.source==="dashboard"&&<>
            <div style={{height:1,background:A.border,margin:"4px 0"}}/>
            <button onClick={()=>{setRenameModal({id:ctxMenu.item.id,name:ctxMenu.item.name});setRenameName(ctxMenu.item.name);setCtxMenu(null)}}
              style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 12px",border:"none",background:"transparent",cursor:"pointer",color:A.t1,fontFamily:FONT,fontSize:13,borderRadius:A.r,textAlign:"left" as const}}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=A.card2}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              폼 이름 변경
            </button>
            <div style={{height:1,background:A.border,margin:"4px 0"}}/>
            <button onClick={()=>{delCfg(ctxMenu.item.id,ctxMenu.item.name);setCtxMenu(null)}}
              style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 12px",border:"none",background:"transparent",cursor:"pointer",color:A.red,fontFamily:FONT,fontSize:13,borderRadius:A.r,textAlign:"left" as const}}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=A.card2}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              휴지통으로 이동
            </button>
          </>}
        </div>
      </>}
      {renderUpdateRefreshPrompt()}
      {renderActionLoading()}
      {/* TOAST */}
      {toast&&(
        <div style={{position:"absolute" as const,top:122,right:20,background:"#15181D",border:"none",borderRadius:10,padding:"12px 14px",fontSize:12.5,fontWeight:500,color:"#fff",zIndex:99999,display:"flex",alignItems:"center",gap:9,boxShadow:"0 8px 28px -6px rgba(16,24,40,.4)",whiteSpace:"nowrap" as const,animation:`${toastLeaving?"toastOut":"toastIn"} .3s cubic-bezier(.4,0,.2,1) forwards`}}>
          <span style={{width:16,height:16,borderRadius:8,background:toast.ok?A.green:A.red,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:700,color:"#fff"}}>{toast.ok?"✓":"!"}</span><span>{toast.msg}</span>
          {toast.undo&&<button onClick={toast.undo}
            style={{marginLeft:8,padding:"2px 10px",borderRadius:5,border:"none",background:"rgba(255,255,255,.1)",cursor:"pointer",color:"#fff",fontFamily:FONT,fontSize:12,fontWeight:600}}>실행 취소</button>}
        </div>
      )}
      {/* GUIDE MODAL */}
      {showGuide&&(()=>{
        const topics:any[] = guideData?.topics||[]
        const curTopic = topics[guideTopic]
        const curPages:any[] = curTopic?.pages||[]
        const curPage = curPages[guidePage]
        const isLastPage = guidePage >= curPages.length-1
        const isLastTopic = guideTopic >= topics.length-1
        const goNext = ()=>{
          if(!isLastPage){setGuidePage(p=>p+1)}
          else if(!isLastTopic){setGuideTopic(t=>t+1);setGuidePage(0)}
        }
        return <div style={{position:"fixed" as const,inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={()=>setShowGuide(false)}>
          <div style={{background:A.card,borderRadius:20,width:"min(860px,95vw)",height:"min(600px,90vh)",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",display:"flex",overflow:"hidden",position:"relative" as const}} onClick={e=>e.stopPropagation()}>

            {/* 왼쪽 사이드바 */}
            <div style={{width:220,background:A.card2,borderRight:`1px solid ${A.border}`,display:"flex",flexDirection:"column" as const,flexShrink:0}}>
              <div style={{padding:"20px 16px 12px",borderBottom:`1px solid ${A.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:28,height:28,borderRadius:8,background:A.blue2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={A.blue} strokeWidth="1.8"/><path d="M12 16v-4M12 8.5v.5" stroke={A.blue} strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <span style={{fontSize:13,fontWeight:600,color:A.t1,letterSpacing:"-0.3px"}}>사용 가이드</span>
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto" as const,padding:"8px 8px"}}>
                {guideLoading
                  ? <div style={{padding:"8px 4px",display:"flex",flexDirection:"column" as const,gap:6}}>
                      {[80,60,70,50,65].map((w,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px"}}>
                          <div style={{width:20,height:20,borderRadius:"50%",background:A.border,flexShrink:0,animation:`skeletonPulse 1.4s ease-in-out infinite`,animationDelay:`${i*0.12}s`}}/>
                          <div style={{height:12,borderRadius:4,background:A.border,width:`${w}%`,animation:`skeletonPulse 1.4s ease-in-out infinite`,animationDelay:`${i*0.12+0.06}s`}}/>
                        </div>
                      ))}
                    </div>
                  : topics.length===0
                    ? <div style={{padding:16,fontSize:12.5,color:A.t3}}>등록된 가이드가 없어요</div>
                    : topics.map((t:any,ti:number)=>{
                        const isActive=guideTopic===ti
                        const done=guideTopic>ti||(guideTopic===ti&&guidePage>=((t.pages||[]).length-1)&&isLastPage)
                        return <button key={ti} onClick={()=>{setGuideTopic(ti);setGuidePage(0)}}
                          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"none",background:isActive?A.blue2:"transparent",cursor:"pointer",textAlign:"left" as const,fontFamily:FONT,display:"flex",alignItems:"center",gap:8,marginBottom:2,transition:"background .12s"}}>
                          <div style={{width:20,height:20,borderRadius:"50%",background:isActive?A.blue:A.card,border:`1.5px solid ${isActive?A.blue:A.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                            <span style={{fontSize:10,fontWeight:600,color:isActive?"#fff":A.t3}}>{ti+1}</span>
                          </div>
                          <span style={{fontSize:12.5,fontWeight:isActive?600:400,color:isActive?A.blue:A.t2,lineHeight:1.4,textAlign:"left" as const}}>{t.label||t.title||"제목 없음"}</span>
                        </button>
                      })}
              </div>
              <div style={{padding:"12px 16px"}}>
                <button onClick={()=>setShowGuide(false)} style={{width:"100%",height:32,borderRadius:8,border:`1px solid ${A.border}`,background:"transparent",color:A.t2,fontFamily:FONT,fontSize:12.5,cursor:"pointer"}}>닫기</button>
              </div>
            </div>

            {/* 오른쪽 콘텐츠 */}
            <div style={{flex:1,display:"flex",flexDirection:"column" as const,overflow:"hidden"}}>
              {guideLoading
                ? <div style={{flex:1,overflowY:"auto" as const}}>
                    {/* 이미지 스켈레톤 */}
                    <div style={{width:"100%",height:240,background:A.border,animation:"skeletonPulse 1.4s ease-in-out infinite"}}/>
                    <div style={{padding:"28px 32px"}}>
                      {/* 진행바 스켈레톤 */}
                      <div style={{display:"flex",gap:5,marginBottom:20}}>
                        {[1,2,3].map(i=><div key={i} style={{height:3,flex:1,borderRadius:2,background:A.border,animation:`skeletonPulse 1.4s ease-in-out infinite`,animationDelay:`${i*0.1}s`}}/>)}
                      </div>
                      {/* 제목 스켈레톤 */}
                      <div style={{height:26,borderRadius:6,background:A.border,width:"65%",marginBottom:16,animation:"skeletonPulse 1.4s ease-in-out infinite"}}/>
                      {/* 본문 스켈레톤 */}
                      {[100,88,94,72].map((w,i)=>(
                        <div key={i} style={{height:14,borderRadius:4,background:A.border,width:`${w}%`,marginBottom:10,animation:`skeletonPulse 1.4s ease-in-out infinite`,animationDelay:`${i*0.08}s`}}/>
                      ))}
                    </div>
                  </div>
                : !curPage
                  ? <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:A.t3}}>왼쪽에서 가이드를 선택해주세요</div>
                  : <>
                      {/* 스크롤 영역 */}
                      <div style={{flex:1,overflowY:"auto" as const}}>
                        {/* 이미지 */}
                        {curPage.imageUrl&&<div style={{width:"100%"}}>
                          <img src={curPage.imageUrl} alt={curPage.imageCaption||""} style={{width:"100%",display:"block",maxHeight:280,objectFit:"cover"}}/>
                          {curPage.imageCaption&&<div style={{padding:"7px 28px",fontSize:11.5,color:A.t3,background:A.card2,borderBottom:`1px solid ${A.border}`}}>{curPage.imageCaption}</div>}
                        </div>}
                        {/* 텍스트 */}
                        <div style={{padding:"28px 32px"}}>
                          {/* 진행 표시 */}
                          {curPages.length>1&&<div style={{display:"flex",gap:5,marginBottom:16}}>
                            {curPages.map((_:any,pi:number)=>(
                              <div key={pi} style={{height:3,flex:1,borderRadius:2,background:pi<=guidePage?A.blue:A.border,transition:"background .2s"}}/>
                            ))}
                          </div>}
                          {/* 제목 */}
                          <div style={{fontSize:20,fontWeight:600,color:A.t1,letterSpacing:"-0.4px",marginBottom:14,lineHeight:1.3}}>{curPage.title}</div>
                          {/* 설명 */}
                          {curPage.desc&&<div style={{fontSize:14,color:A.t2,lineHeight:1.8,whiteSpace:"pre-line" as const}}>{curPage.desc}</div>}
                        </div>
                      </div>
                      {/* 하단 버튼 */}
                      <div style={{padding:"16px 32px",borderTop:`1px solid ${A.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                        <button onClick={()=>{if(guidePage>0)setGuidePage(p=>p-1);else if(guideTopic>0){setGuideTopic(t=>t-1);setGuidePage(0)}}}
                          style={{height:36,padding:"0 16px",borderRadius:8,border:`1px solid ${A.border}`,background:"transparent",color:A.t2,fontFamily:FONT,fontSize:13,cursor:guideTopic===0&&guidePage===0?"not-allowed":"pointer",opacity:guideTopic===0&&guidePage===0?0.3:1}}>
                          ← 이전
                        </button>
                        <span style={{fontSize:12,color:A.t3}}>{guideTopic+1} / {topics.length}</span>
                        {!isLastPage||!isLastTopic
                          ? <button onClick={goNext}
                              style={{height:36,padding:"0 20px",borderRadius:8,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                              다음 단계 →
                            </button>
                          : <button onClick={()=>setShowGuide(false)}
                              style={{height:36,padding:"0 20px",borderRadius:8,border:"none",background:A.green,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:600,cursor:"pointer"}}>
                              완료 ✓
                            </button>
                        }
                      </div>
                    </>
              }
            </div>
          </div>
        </div>
      })()}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────
  // ── VIEW: BUILDER ────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────
  if(view==="analytics") return renderAnalyticsPage()
  if(view!=="builder") return null  // safety guard

  const seniorMode=!!cfg.styles.seniorMode
  const baseFC=cfg.styles.theme==="dark"?FD:FL
  const FC=seniorMode?seniorFormColors(baseFC):baseFC
  const accentBg=cfg.cta.bg||"#E85C5C"
  const accentText=seniorMode?SENIOR_TEXT.t1:accentBg
  const fh=seniorFieldHeight(seniorMode,cfg.styles.fieldH||44)
  const qg=seniorGap(seniorMode,cfg.styles.qGap||16)
  const fr=seniorMode?"10px":cfg.styles.theme==="dark"?"6px":"8px"
  const fs=(size:number)=>seniorFontSize(seniorMode,size)
  const previewConsentPosition:ConsentPosition=cfg.form.consentPosition==="start"?"start":"end"
  const previewPageShowsConsents=previewConsentPosition==="start"?(!isMultiPage||pvPage===1):(!isMultiPage||pvPage===formPages)
  const renderPreviewConsents=()=>cfg.consents.filter(cs=>cs.enabled).map((cs,idx)=>{
    const policyType=cs.consentType||consentTypeFromTitle(cs.title)
    const customBody=String(cs.customPolicyBody||"").trim()
    const policyUrl=cs.policyMode==="custom"?"":policyUrlForConsent(policyType,currentBrand)||cs.policyUrl
    return <div key={idx} style={{marginBottom:qg}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:14,fontWeight:600,color:FC.t1,display:"flex",alignItems:"center",gap:3}}>
          {cs.title}{cs.required&&<span style={{color:accentBg,fontSize:14,fontWeight:600,lineHeight:1}}>*</span>}
        </div>
        {cs.policyMode==="custom"&&customBody
          ? <button onClick={()=>openCustomPolicyPreview(cs)} style={{fontSize:12,fontWeight:600,color:accentBg,textDecoration:"none",padding:"2px 9px",borderRadius:5,border:`1px solid ${accentBg}44`,background:"transparent",cursor:"pointer",fontFamily:FONT,flexShrink:0}}>보기</button>
          : policyUrl&&<a href={policyUrl} target="_blank" rel="noopener" style={{fontSize:12,fontWeight:600,color:accentBg,textDecoration:"none",padding:"2px 9px",borderRadius:5,border:`1px solid ${accentBg}44`,flexShrink:0}}>보기</a>}
      </div>
      {(()=>{
        const lines=cs.body.split("\n")
        const LIMIT=3
        const needsAccordion=lines.length>LIMIT
        const open=consentBodyOpen[idx]||false
        const setOpen=(v:boolean|((p:boolean)=>boolean))=>setConsentBodyOpen(a=>{const n=[...a];n[idx]=typeof v==="function"?v(a[idx]||false):v;return n})
        const visible=needsAccordion&&!open?lines.slice(0,LIMIT).join("\n"):cs.body
        const renderBody=(text:string)=><span dangerouslySetInnerHTML={{__html:mdToHtml(text)}}/>
        return <div style={{borderTop:`1px solid ${FC.fieldBorder}`,paddingTop:10,marginBottom:10}}>
          <div style={{fontSize:12,color:FC.t2,lineHeight:1.7}}>
            {renderBody(visible)}
          </div>
          {needsAccordion&&<button onClick={()=>setOpen(v=>!v)}
            style={{display:"flex",alignItems:"center",gap:4,marginTop:4,background:"none",border:"none",cursor:"pointer",color:accentBg,fontFamily:FONT,fontSize:11.5,fontWeight:600,padding:0}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{transform:open?"rotate(180deg)":"none",transition:"transform .2s"}}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {open?"접기":"전체 보기"}
          </button>}
        </div>
      })()}
      <div style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer"}} onClick={()=>setPvOk(v=>!v)}>
        <div style={{width:16,height:16,borderRadius:4,border:`1px solid ${pvOk?accentBg+"cc":FC.fieldBorder}`,background:pvOk?accentBg+"d9":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
          {pvOk&&<span style={{color:"#fff",fontSize:11,fontWeight:600}}>✓</span>}
        </div>
        <span style={{fontSize:13,color:FC.t2}}>{cs.checkLabel}</span>
      </div>
    </div>
  })

  // ── Nav items ─────────────────────────────────────────────────────────
  const NAV=[
    {group:"콘텐츠",items:[
      {id:"header",label:"기본 정보"},
      {id:"notice",label:"안내 문구"},
      {id:"ad",label:"광고",badge:cfg.ad?.enabled?"ON":"OFF"},
      {id:"form",label:"폼 질문"},
      {id:"consent",label:"동의",badge:cfg.consents.some(c=>c.enabled)?"ON":"OFF"},
      {id:"login",label:"로그인",badge:cfg.auth.enabled?"ON":"OFF"},
    ]},
    {group:"설정",items:[
      {id:"integrations",label:"응답 연동",badge:cfg.integrations?.googleSheets?.enabled?"ON":"OFF"},
      {id:"slug",label:"슬러그"},
      {id:"qr",label:"QR"},
    ]},
    {group:"UI",items:[
      {id:"cta",label:"CTA 버튼"},
      {id:"modal",label:"완료 모달"},
      {id:"styles",label:"스타일"},
    ]},
  ]

  const selS:React.CSSProperties={width:"100%",height:40,background:panelFieldBg(A),border:"none",borderRadius:9,color:A.t1,fontFamily:FONT,fontSize:12.5,padding:"0 30px 0 12px",outline:"none",cursor:"pointer",boxSizing:"border-box" as const,colorScheme:adminDark?"dark" as any:"light" as any}

  // ── Panel content ─────────────────────────────────────────────────────
  function renderPanel():React.ReactNode {
    const pd:React.CSSProperties={padding:"0 20px 22px"}
    switch(sec){
      case "header": return <div style={pd}>
        <FG title="대표 이미지" A={A}>
          {cfg.header.imageUrl&&<div style={{position:"relative",marginBottom:10}}>
            <div style={{...imagePreviewBoxStyle(cfg.header,120),height:hasImageCrop(cfg.header)?"auto":120,border:`1px solid ${A.border}`}}>
              <img src={cfg.header.imageUrl} alt="" style={imagePreviewImgStyle(cfg.header)}/>
            </div>
            <button onClick={()=>uh("imageUrl","")} style={{position:"absolute",top:6,right:6,width:22,height:22,borderRadius:"50%",background:"rgba(0,0,0,0.65)",border:"none",color:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            {renderImageCropControls(cfg.header,()=>openImageCropModal("header",cfg.header),()=>setCfg(p=>({...p,header:{...p.header,imageFit:"contain"}})))}
          </div>}
          <label style={{height:52,display:"flex",alignItems:"center",gap:8,padding:"0 12px",borderRadius:10,background:panelFieldBg(A),border:"none",cursor:"pointer",fontSize:12.5,color:A.t2,fontFamily:FONT,boxSizing:"border-box" as const}}>
            <span style={{display:"flex",alignItems:"center",gap:7,fontWeight:600}}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 12.5V3.5M4.5 7 8 3.5 11.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              이미지 업로드
            </span>
            <span style={{marginLeft:"auto",fontSize:11.5,color:A.t3,fontWeight:400}}>1400 × 400</span><input type="file" accept="image/*" onChange={onImg} style={{display:"none"}}/>
          </label>
        </FG>
        <FG title="프로그램" A={A}>
          <div style={{display:"flex",justifyContent:"flex-end",margin:"-2px 0 8px"}}>
            <label style={{display:"inline-flex",alignItems:"center",gap:6,color:cfg.header.programUnlinked?A.blue:A.t2,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:FONT}}>
              <input type="checkbox" checked={!!cfg.header.programUnlinked} onChange={e=>setCfg(p=>({...p,header:{...p.header,programUnlinked:e.target.checked,programId:e.target.checked?"":p.header.programId}}))}/>
              연동 안함
            </label>
          </div>
          {!cfg.header.programUnlinked&&<F label="과정 선택" A={A}>
            {programCatalogLoading&&progs.length===0
              ? <div style={{padding:"10px 11px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t2,fontSize:12.5,lineHeight:1.55}}>교육과정 목록을 불러오는 중이에요.</div>
              : programCatalogErr&&progs.length===0
              ? <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:A.r,border:`1px solid ${A.red}44`,background:`${A.red}10`,color:A.red,fontSize:12.5,lineHeight:1.45}}>
                  <span style={{flex:1}}>교육과정 목록을 불러오지 못했어요. {programCatalogErr}</span>
                  <button onClick={()=>loadProgramCatalog(supa)} disabled={programCatalogLoading} style={{height:28,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.red}55`,background:A.card,color:A.red,fontFamily:FONT,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap" as const}}>다시 불러오기</button>
                </div>
              : progs.length===0
              ? <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t2,fontSize:12.5,lineHeight:1.45}}>
                  <span style={{flex:1}}>표시할 교육과정이 없어요. 목록이 늦게 반영된 경우 다시 불러와 주세요.</span>
                  <button onClick={()=>loadProgramCatalog(supa)} disabled={programCatalogLoading} style={{height:28,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card,color:A.t2,fontFamily:FONT,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap" as const}}>새로고침</button>
                </div>
              : <>
                  <ProgramPicker progs={progs} cats={cats} brand={currentBrand} value={cfg.header.programId}
                    onChange={applyLinkedProgram} A={A}/>
                  {(programCatalogLoading||programCatalogErr||cats.length===0)&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,padding:"8px 10px",borderRadius:A.r,border:`1px solid ${programCatalogErr?A.red+"44":A.border}`,background:programCatalogErr?`${A.red}10`:A.card2,color:programCatalogErr?A.red:A.t3,fontSize:12,lineHeight:1.45}}>
                    <span style={{flex:1}}>{programCatalogLoading?"교육과정 목록을 새로고침하는 중이에요.":programCatalogErr?`최신 목록을 불러오지 못했어요. 기존 목록으로 선택할 수 있습니다. ${programCatalogErr}`:"카테고리 정보를 확인하지 못해 일부 과정이 보이지 않을 수 있어요."}</span>
                    {!programCatalogLoading&&<button onClick={()=>loadProgramCatalog(supa)} style={{height:26,padding:"0 9px",borderRadius:A.r,border:`1px solid ${programCatalogErr?A.red+"55":A.border}`,background:A.card,color:programCatalogErr?A.red:A.t2,fontFamily:FONT,fontSize:11.5,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap" as const}}>다시 불러오기</button>}
                  </div>}
                </>}
          </F>}
          {!cfg.header.programUnlinked&&cfg.header.programId&&(()=>{
            const linkedProgram=progs.find(p=>p.id===cfg.header.programId)
            const currentMode=recruitmentPeriodModeOf(cfg)
            return <F label="폼 운영 기간 기준" A={A}>
              <PanelSegment value={currentMode} onChange={v=>setRecruitmentPeriodMode(v as RecruitmentPeriodMode)} A={A}
                options={(["pre","formal"] as RecruitmentPeriodMode[]).map(mode=>({value:mode,label:recruitmentPeriodLabel(mode)}))}/>
              <div style={{marginTop:8,fontSize:11.5,color:A.t3,lineHeight:1.5,wordBreak:"keep-all" as const,overflowWrap:"break-word" as const}}>
                {recruitmentPeriodText(recruitmentPeriodOf(linkedProgram,currentMode))}
              </div>
            </F>
          })()}
          {cfg.header.programUnlinked&&<div style={{padding:"9px 11px",marginBottom:10,borderRadius:A.r,border:`1px solid ${A.blue}33`,background:A.blue2,color:A.blue,fontSize:12,lineHeight:1.55}}>교육과정과 연결하지 않습니다. 저장할 때 폼 운영 기간을 설정해주세요.</div>}
          <F label="제목" hint="Enter로 원하는 위치에서 줄바꿈할 수 있어요." A={A}>
            <TArea value={cfg.header.title} onChange={v=>uh("title",v)} minH={84} A={A}/>
          </F>
          <F label="지원 유형" A={A}>
            {cfg.formType==="alert"
              ? <div style={{height:42,display:"flex",alignItems:"center",gap:8,padding:"0 12px",borderRadius:10,background:panelFieldBg(A),border:"none",fontSize:12.5,color:A.t3,fontFamily:FONT,boxSizing:"border-box" as const}}>
                  <span style={{padding:"2px 8px",borderRadius:4,background:A.blue2,color:A.blue,fontSize:11,fontWeight:600}}>자동</span> 사전 알림
                </div>
              : cfg.formType==="kdt"
              ? <div style={{height:42,display:"flex",alignItems:"center",gap:8,padding:"0 12px",borderRadius:10,background:panelFieldBg(A),border:"none",fontSize:12.5,color:A.t3,fontFamily:FONT,boxSizing:"border-box" as const}}>
                  <span style={{padding:"2px 8px",borderRadius:4,background:A.blue2,color:A.blue,fontSize:11,fontWeight:600}}>자동</span> 정식 신청
                </div>
              : (()=>{
                  const custom=!!cfg.header.applicationType&&cfg.header.applicationType!=="pre"&&cfg.header.applicationType!=="formal"
                  return <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
                    <PanelSegment value={cfg.header.applicationType||""} A={A}
                      onChange={v=>{setShowCustomAppType(false);uh("applicationType",v)}}
                      options={[{value:"pre",label:"사전 알림"},{value:"formal",label:"정식 신청"}]}/>
                    {custom||showCustomAppType
                      ? <TIn value={custom?cfg.header.applicationType||"":""} onChange={v=>uh("applicationType",v)} placeholder="직접 입력 (예: interview)" A={A}/>
                      : <button onClick={()=>setShowCustomAppType(true)}
                          style={{alignSelf:"flex-start" as const,height:28,padding:"0 2px",border:"none",background:"transparent",color:A.t2,fontFamily:FONT,fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          직접 입력
                        </button>}
                  </div>
                })()
            }
          </F>
        </FG>
        <FG title="상세 정보" A={A} last>
          <F label="교육기간" A={A}>
            <EducationSchedulesEditor schedules={educationSchedulesFromHeader(cfg.header)} onChange={setEducationSchedules} A={A}/>
          </F>
          <F label="수강료" A={A}>
            <div style={{marginBottom:8}}>
              <PanelSegment value={cfg.header.tuitionFree?"free":"paid"} onChange={v=>uh("tuitionFree",v==="free")} A={A}
                options={[{value:"free",label:"무료"},{value:"paid",label:"유료"}]}/>
            </div>
            {cfg.header.tuitionFree
              ?<TIn value={cfg.header.tuitionFreeText} onChange={v=>uh("tuitionFreeText",v)} placeholder="수강료 전액 무료" A={A}/>
              :<div style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="text" value={cfg.header.tuitionAmount} onChange={e=>uh("tuitionAmount",fmtNum(e.target.value))} placeholder="0" inputMode="numeric"
                  style={{flex:1,height:40,background:panelFieldBg(A),border:"none",borderRadius:9,color:A.t1,fontFamily:FONT,fontSize:12.5,padding:"0 12px",outline:"none",textAlign:"right" as const,boxSizing:"border-box" as const}}/>
                <span style={{color:A.t2,flexShrink:0,fontFamily:FONT,fontSize:13}}>원</span>
              </div>}
          </F>
          <F label="지급 수당" A={A}><TIn value={cfg.header.stipend} onChange={v=>uh("stipend",v)} placeholder="최대 285만 원" A={A}/></F>
        </FG>
      </div>

      case "notice": return <div style={pd}>
        <FG A={A} last>
          <TRow label="안내 문구 표시" on={cfg.header.noticeEnabled} toggle={()=>uh("noticeEnabled",!cfg.header.noticeEnabled)} A={A}/>
          <F label="박스 모양" A={A}>
            <PanelSegment value={cfg.header.noticeShape||"pill"} onChange={v=>uh("noticeShape",v as "pill"|"rect")} A={A}
              options={[
                {value:"pill",label:"알약형",icon:<svg width="30" height="14" viewBox="0 0 44 18" fill="none" style={{flexShrink:0}}><rect x="1" y="1" width="42" height="16" rx="8" stroke="currentColor" strokeWidth="1.8" fill="transparent"/></svg>},
                {value:"rect",label:"사각형",icon:<svg width="30" height="14" viewBox="0 0 44 18" fill="none" style={{flexShrink:0}}><rect x="1" y="1" width="42" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" fill="transparent"/></svg>},
              ]}/>
          </F>
          <div style={{marginBottom:12}}>
            <PanelCheckRow label="아이콘 표시" on={!!cfg.header.noticeIconEnabled} toggle={()=>uh("noticeIconEnabled",!cfg.header.noticeIconEnabled)} A={A}/>
          </div>
          {cfg.header.noticeIconEnabled&&<F label="아이콘 텍스트" A={A}><TIn value={cfg.header.noticeIconText} onChange={v=>uh("noticeIconText",v)} A={A}/></F>}
          <F label="안내 문구" A={A}><ConsentBodyEditor value={cfg.header.noticeText} onChange={v=>uh("noticeText",v)} A={A}/></F>
        </FG>
      </div>

      case "ad": {
        const ad={...DEFAULT_FORM_AD,...(cfg.ad||{})}
        return <div style={pd}>
          <FG title="광고 구좌" A={A}>
            <TRow label="광고 구좌 표시" on={!!ad.enabled} toggle={()=>uad("enabled",!ad.enabled)} A={A}/>
            <div style={{fontSize:12,color:A.t3,lineHeight:1.6,marginTop:8}}>대표이미지와 폼 제목 아래, 공지와 질문 시작 전에 광고 구좌가 표시됩니다.</div>
          </FG>
          <FG title="광고 소재" A={A} last>
            <F label="소재 방식" A={A}>
              <PanelSegment value={ad.adMode} onChange={v=>uad("adMode",v as AdMode)} A={A}
                options={[{value:"image",label:"이미지 배너"},{value:"split",label:"텍스트 + 요소"}]}/>
            </F>
            {ad.adMode==="image"
              ? <F label="이미지 배너" hint="광고 구좌 전체를 채우는 배너 이미지를 넣습니다." A={A}>
                  {ad.imageUrl
                    ? <div>
                        <div style={{...imagePreviewBoxStyle(ad,130),border:`1px solid ${A.border}`,marginBottom:6}}>
                          <img src={ad.imageUrl} alt="" style={imagePreviewImgStyle(ad)}/>
                          <button onClick={()=>setCfg(p=>({...p,ad:{...DEFAULT_FORM_AD,...(p.ad||{}),imageUrl:"",imageCaption:""}}))}
                            style={{position:"absolute",top:6,right:6,width:24,height:24,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.5)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,lineHeight:1}}>×</button>
                        </div>
                        {renderImageCropControls(ad,()=>openImageCropModal("ad",ad),()=>setCfg(p=>({...p,ad:{...DEFAULT_FORM_AD,...(p.ad||{}),imageFit:"contain"}})))}
                      </div>
                    : <div>
                        <label htmlFor="form_ad_image_upload" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,height:56,borderRadius:A.r,border:`1.5px dashed ${A.border}`,background:A.card2,cursor:"pointer",fontFamily:FONT,color:A.t3}}>
                          <span style={{fontSize:12.5,fontWeight:700}}>이미지 파일 업로드</span>
                          <span style={{fontSize:11,fontWeight:500}}>{AD_IMAGE_SIZE_TEXT}</span>
                        </label>
                        <input id="form_ad_image_upload" type="file" accept="image/*" style={{display:"none"}}
                          onChange={async e=>{
                            const file=e.target.files?.[0]
                            if(!file)return
                            try {
                              const result=await readCompressedImageFile(file)
                              if(result){
                                setCfg(p=>({...p,ad:{...DEFAULT_FORM_AD,...(p.ad||{}),imageUrl:result,imageFit:"cover",imagePosX:50,imagePosY:50,imageCropX:0,imageCropY:0,imageCropW:100,imageCropH:100}}))
                                setImageNaturalSize("ad",result)
                              }
                            } catch {
                              showToast("이미지 업로드에 실패했어요.", false)
                            } finally {
                              e.target.value=""
                            }
                          }}/>
                      </div>}
                </F>
              : <div>
                  <F label="메인 텍스트" A={A}><TArea value={ad.adMainText||""} onChange={v=>uad("adMainText",v)} minH={44} A={A}/></F>
                  <F label="서브 텍스트" A={A}><TArea value={ad.adSubText||""} onChange={v=>uad("adSubText",v)} minH={44} A={A}/></F>
                  <F label="오른쪽 요소 텍스트" hint="이미지를 넣으면 텍스트 대신 이미지가 표시됩니다." A={A}><TIn value={ad.adElementText||""} onChange={v=>uad("adElementText",v)} A={A}/></F>
                  <F label="오른쪽 요소 이미지" hint="투명 PNG나 배경 없는 상품 이미지를 넣으면 더 자연스럽게 보입니다." A={A}>
                    {ad.adElementImageUrl
                      ? <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <img src={ad.adElementImageUrl} alt="" style={{width:120,height:56,objectFit:"contain",borderRadius:A.r,background:A.card2}}/>
                          <button onClick={()=>uad("adElementImageUrl","")} style={{height:32,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:"transparent",color:A.t2,fontFamily:FONT,fontSize:12,cursor:"pointer"}}>삭제</button>
                        </div>
                      : <div>
                          <label htmlFor="form_ad_element_upload" style={{display:"flex",alignItems:"center",justifyContent:"center",height:36,borderRadius:A.r,border:`1.5px dashed ${A.border}`,background:A.card2,cursor:"pointer",fontSize:12.5,color:A.t3,fontFamily:FONT,fontWeight:700}}>이미지 업로드</label>
                          <input id="form_ad_element_upload" type="file" accept="image/*" style={{display:"none"}}
                            onChange={async e=>{
                              const file=e.target.files?.[0]
                              if(!file)return
                              try {
                                const result=await readCompressedImageFile(file)
                                if(result)uad("adElementImageUrl",result)
                              } catch {
                                showToast("이미지 업로드에 실패했어요.", false)
                              } finally {
                                e.target.value=""
                              }
                            }}/>
                        </div>}
                  </F>
                  <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:8,width:"100%"}}>
                    <div style={{minWidth:0}}><F label="배경색" A={A}><CIn value={ad.adBg||"#FEE500"} onChange={v=>uad("adBg",v)} A={A}/></F></div>
                    <div style={{minWidth:0}}><F label="글자색" A={A}><CIn value={ad.adTextColor||"#191919"} onChange={v=>uad("adTextColor",v)} A={A}/></F></div>
                  </div>
                </div>}
            <F label="클릭 URL" hint="입력하면 실제 폼에서 광고 전체가 링크로 동작합니다." A={A}>
              <TIn value={ad.adHref||""} onChange={v=>uad("adHref",v)} placeholder="https://..." A={A}/>
            </F>
          </FG>
        </div>
      }

      case "form": {
        const FTYPES=FTYPES_DATA
        const pageFields:any[] = isKdt
          ? (cfg.kdtFields||[]).filter(f=>f.page===pvPage)
          : isMultiPage ? (cfg.form.fields||[]).filter(f=>(f.page||1)===pvPage) : cfg.form.fields||[]
        const pageLabels=["기본 정보","상세 정보","자격 요건 및 동의"]
        return <div style={pd}>
          {/* Page tabs — 세로 리스트 */}
          <div style={{marginBottom:18,padding:10,background:panelFieldBg(A),borderRadius:11,border:"none"}}>
            {/* 헤더 */}
            <div style={{display:"flex",alignItems:"center",padding:"0 4px 10px"}}>
              <span style={{fontSize:12,fontWeight:600,color:A.t3,flex:1}}>섹션 목록</span>
              <button onClick={()=>{if(isKdt){const newPage=formPages+1;setCfg(p=>({...p,kdtFields:[...(p.kdtFields||[]),{id:"kdt_p"+newPage+"_"+Date.now(),label:"새 질문",type:"text" as const,page:newPage,required:false}]}));setPvPage(newPage)}else{addPage();setPvPage(formPages+1)}}}
                style={{display:"flex",alignItems:"center",gap:4,height:30,padding:"0 11px",borderRadius:8,border:`1.5px dashed ${A.border2}`,background:"transparent",cursor:"pointer",color:A.t2,fontFamily:FONT,fontSize:12,fontWeight:600}}>
                <span style={{fontSize:14,lineHeight:1}}>+</span> 섹션 추가
              </button>
            </div>
            {/* 섹션 리스트 */}
            {Array.from({length:formPages},(_,i)=>i+1).map((p,i)=>{
              const isActive=pvPage===p
              const isDragging=sectionDragIdx===i
              const isDragOver=sectionDragOver===i
              return <div key={p}
                onDragOver={e=>{
                  if(sectionDragIdx===null)return
                  e.preventDefault()
                  setSectionDragOver(i)
                  const rect=(e.currentTarget as HTMLElement).getBoundingClientRect()
                  setSectionDragInsertAt(e.clientY<rect.top+rect.height/2?i:i+1)
                }}
                onDrop={e=>{
                  e.preventDefault()
                  if(sectionDragIdx!==null&&sectionDragInsertAt!==null){
                    let target=sectionDragInsertAt
                    if(target>sectionDragIdx)target-=1
                    moveSection(sectionDragIdx,target)
                  }
                  setSectionDragIdx(null);setSectionDragOver(null);setSectionDragInsertAt(null)
                }}
                onDragLeave={()=>{setSectionDragOver(null);setSectionDragInsertAt(null)}}
                style={{position:"relative" as const,opacity:isDragging?0.45:1,transition:"opacity .15s"}}>
                {sectionDragInsertAt===i&&sectionDragIdx!==i&&<div style={{position:"absolute" as const,top:-1,left:10,right:10,height:2,borderRadius:1,background:A.blue,zIndex:5,pointerEvents:"none" as const}}/>}
                {sectionDragInsertAt===i+1&&sectionDragIdx!==i&&i===formPages-1&&<div style={{position:"absolute" as const,bottom:-1,left:10,right:10,height:2,borderRadius:1,background:A.blue,zIndex:5,pointerEvents:"none" as const}}/>}
                <div style={{height:42,display:"flex",alignItems:"center",gap:9,padding:"0 11px",borderRadius:9,background:isActive?(adminDark?A.blue2:"#E4EDFC"):"transparent",cursor:"pointer",transition:"background .1s"}}
                  onClick={()=>{setPvPage(p);setEditIdx(null)}}>
                  <div
                    draggable
                    title="드래그해서 섹션 순서 변경"
                    onMouseDown={e=>e.stopPropagation()}
                    onClick={e=>e.stopPropagation()}
                    onDragStart={e=>{
                      e.stopPropagation()
                      setSectionDragIdx(i)
                      setSectionDragOver(null)
                      setSectionDragInsertAt(null)
                      setPanelDragIdx(null)
                      setPanelDragOver(null)
                      setEditIdx(null)
                      e.dataTransfer.effectAllowed="move"
                      try{e.dataTransfer.setData("text/plain",String(i))}catch{}
                    }}
                    onDragEnd={e=>{
                      e.stopPropagation()
                      setSectionDragIdx(null);setSectionDragOver(null);setSectionDragInsertAt(null)
                    }}
                    style={{width:16,height:20,display:"flex",alignItems:"center",justifyContent:"center",cursor:isDragging?"grabbing":"grab",color:isActive?A.blue:A.t4,flexShrink:0}}>
                    <DragHandleIcon size={13}/>
                  </div>
                  {/* 활성 인디케이터 */}
                  <div style={{width:3,height:15,borderRadius:2,background:isActive?A.blue:A.border2,flexShrink:0,transition:"background .15s"}}/>
                  {/* 이름 — 더블클릭 시 편집 */}
                  <span
                    onDoubleClick={e=>{e.stopPropagation();const el=e.currentTarget;el.contentEditable="true";el.focus();const r=document.createRange();r.selectNodeContents(el);window.getSelection()?.removeAllRanges();window.getSelection()?.addRange(r)}}
                    onBlur={e=>{e.currentTarget.contentEditable="false";setPageLabel(p,e.currentTarget.textContent||getPageLabel(p))}}
                    onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();(e.currentTarget as HTMLElement).blur()}e.stopPropagation()}}
                    onClick={()=>{setPvPage(p);setEditIdx(null)}}
                    style={{flex:1,color:isActive?A.blue:A.t1,fontFamily:FONT,fontSize:isActive?13:12.5,fontWeight:isActive?700:500,outline:"none",cursor:"default",minWidth:0,userSelect:"none" as const}}>
                    {getPageLabel(p)}
                  </span>
                  {/* 필드 개수 뱃지 */}
                  <span style={{fontSize:11,fontWeight:600,color:A.t3,flexShrink:0,background:A.card,padding:"2px 8px",borderRadius:999,border:"none"}}>
                    {isKdt?(cfg.kdtFields||[]).filter(f=>f.page===p).length:cfg.form.fields.filter(f=>(f.page||1)===p).length}개
                  </span>
                  {/* 삭제 버튼 */}
                  {p>1&&<button onClick={e=>{e.stopPropagation();removePage(p)}}
                    style={{width:18,height:18,borderRadius:"50%",border:"none",background:"transparent",cursor:"pointer",color:A.t3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,lineHeight:1,flexShrink:0,padding:0}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=A.red}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=A.t3}}>×</button>}
                </div>
                {isDragOver&&sectionDragIdx!==i&&sectionDragInsertAt===null&&<div style={{height:2,background:A.blue,borderRadius:1,margin:"0 10px"}}/>}
              </div>
            })}
          </div>
          {/* Layer list */}
          <div style={{marginBottom:12}}>
            {isKdt&&<div style={{fontSize:11,fontWeight:700,color:A.t3,marginBottom:8}}>{getPageLabel(pvPage)}</div>}
            {!isKdt&&<div style={{fontSize:12,fontWeight:600,color:A.t3,marginBottom:8}}>필드 레이어</div>}
            {pageFields.length===0&&<div style={{padding:"16px",textAlign:"center" as const,fontSize:12.5,color:A.t3,borderRadius:A.r,border:`1px dashed ${A.border2}`}}>필드를 추가해주세요</div>}
            {pageFields.map((field,idx)=>(
              <div key={(field as any).id||idx}
                draggable
                onDragStart={e=>{
                  if((e.target as HTMLElement)?.closest?.("[data-option-drag-handle='true']")){e.stopPropagation();return}
                  setPanelDragIdx(idx);setEditIdx(null)
                }}
                onDragOver={e=>{e.preventDefault();setPanelDragOver(idx)}}
                onDragLeave={()=>setPanelDragOver(null)}
                onDrop={()=>{
                  if(panelDragIdx!==null&&panelDragIdx!==idx)moveActiveField(panelDragIdx,idx)
                  setPanelDragIdx(null);setPanelDragOver(null)
                }}
                onDragEnd={()=>{setPanelDragIdx(null);setPanelDragOver(null)}}
                style={{opacity:panelDragIdx===idx?0.4:1,transition:"opacity .15s"}}>
                {panelDragOver===idx&&panelDragIdx!==idx&&<div style={{height:2,borderRadius:1,background:A.blue,marginBottom:2}}/>}
                <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
	                  {/* Drag handle */}
	                  <div style={{width:16,display:"flex",alignItems:"center",justifyContent:"center",cursor:"grab",color:A.t4,flexShrink:0}}>
	                    <DragHandleIcon size={13}/>
	                  </div>
                  <div
                    style={{flex:1,height:48,display:"flex",alignItems:"center",gap:10,padding:"0 8px",borderRadius:10,border:"none",background:editIdx===idx?A.blue2:"transparent",boxShadow:editIdx===idx?`inset 0 0 0 1.5px ${A.blue}`:"none",cursor:"pointer",transition:"all .1s",minWidth:0}}
                    onClick={()=>{setPanelDragIdx(null);setPanelDragOver(null);setOptionDrag(null);setOptionDragOver(null);setEditIdx(editIdx===idx?null:idx)}}>
                    <div style={{width:34,height:34,borderRadius:9,background:panelFieldBg(A),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"none",color:A.t2}}>
                      {FTYPE_ICONS[(field as any).type as string]||FTYPE_ICONS.text}
                    </div>
                    <span style={{flex:1,fontSize:12.5,fontWeight:500,color:A.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{(field as any).label||"(라벨 없음)"}</span>
                    {(field as any).required&&<span style={{fontSize:11.5,color:accentBg,fontWeight:700,flexShrink:0}}>필수</span>}
                  </div>
                  {!isKdt&&<button
                    onClick={e=>{e.stopPropagation();duplicateField(cfg.form.fields.indexOf(pageFields[idx] as FormField))}}
                    title="복사"
                    style={{width:26,height:26,borderRadius:7,border:"none",background:"transparent",cursor:"pointer",color:A.t3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"color .1s"}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=A.blue;(e.currentTarget as HTMLElement).style.background=A.card2}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=A.t3;(e.currentTarget as HTMLElement).style.background="transparent"}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>}
                  <button
                    onClick={e=>{e.stopPropagation();if(isKdt){const kf=cfg.kdtFields||[];const pf=kf.filter((f:any)=>f.page===pvPage);const globalIdx=kf.indexOf(pf[idx]);setCfg(p=>({...p,kdtFields:p.kdtFields!.filter((_,i)=>i!==globalIdx)}))}else{removeField(cfg.form.fields.indexOf(pageFields[idx] as FormField))};setEditIdx(null)}}
                    style={{width:26,height:26,borderRadius:7,border:"none",background:"transparent",cursor:"pointer",color:A.t3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"color .1s"}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color=A.red;(e.currentTarget as HTMLElement).style.background=A.card2}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color=A.t3;(e.currentTarget as HTMLElement).style.background="transparent"}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                {editIdx===idx&&<div style={{borderRadius:10,background:A.card,boxShadow:`inset 0 0 0 1px ${A.border}`,marginBottom:6,overflow:"hidden"}}>
                  {!isKdt&&<div style={{padding:"12px 12px 0"}}>
                    <F label="유형" A={A}>
                      <PanelSelect value={(field as any).type||"text"} onChange={v=>patchActiveField(idx,{type:v as FieldType})} A={A} height={40} fontSize={12.5} radius={9} padX={12}
                        options={FTYPES.filter(ft=>!ft.divider).map(ft=>({value:ft.type,label:ft.label}))}/>
                    </F>
                  </div>}
                  {!isDisplayOnlyFieldType((field as any).type)&&<div style={{padding:"0 12px 14px"}}><PanelCheckRow label="필수 입력" on={!!(field as any).required} toggle={()=>patchActiveField(idx,{required:!(field as any).required})} A={A}/></div>}
                  {!isDisplayOnlyFieldType((field as any).type)&&<div style={{padding:"10px 12px"}}><F label="질문 텍스트" A={A}><TArea value={(field as any).label||""} onChange={v=>patchActiveField(idx,{label:v})} minH={36} A={A}/></F></div>}
                  {/* 안내 문구 (helper) — info 제외 */}
                  {!isDisplayOnlyFieldType((field as any).type)&&(()=>{
                    const rawHelpers:any[]=((field as any).helpers)||((field as any).helper?[{text:(field as any).helper,callout:false}]:[])
                    const helpers:HelperItem[]=rawHelpers.map((h:any)=>typeof h==="string"?{text:h,callout:false}:h)
                    const setHelpers=(arr:HelperItem[])=>patchActiveField(idx,{helpers:arr,helper:arr[0]?.text||""})
                    return <div style={{padding:"10px 12px"}}>
                      <div style={{fontSize:12.5,fontWeight:600,color:A.t1,marginBottom:4}}>보조 안내 문구</div>
                      <div style={{fontSize:11.5,color:A.t3,lineHeight:1.5,marginBottom:8}}>질문 아래 작게 표시됩니다.</div>
                      {helpers.map((h,hi)=>(
                        <div key={hi} style={{marginBottom:8}}>
                          <div style={{display:"flex",gap:5,marginBottom:4}}>
                            <div style={{flex:1}}>
                              <ConsentBodyEditor value={h.text} onChange={v=>{const a=[...helpers];a[hi]={...a[hi],text:v};setHelpers(a)}} A={A}/>
                            </div>
                            <button onClick={()=>setHelpers(helpers.filter((_,i)=>i!==hi))}
                              style={{width:28,height:28,borderRadius:A.r,border:"none",background:"transparent",cursor:"pointer",color:A.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,alignSelf:"flex-start",marginTop:2}}>×</button>
                          </div>
                          <button onClick={()=>{const a=[...helpers];a[hi]={...a[hi],callout:!a[hi].callout};setHelpers(a)}}
                            style={{display:"flex",alignItems:"center",gap:5,height:28,padding:"0 10px",borderRadius:7,border:"none",background:h.callout?A.blue2:panelFieldBg(A),cursor:"pointer",color:h.callout?A.blue:A.t3,fontFamily:FONT,fontSize:11.5,fontWeight:600,transition:"background .15s, color .15s"}}>
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 12l2 2 2-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                            콜아웃 박스
                          </button>
                        </div>
                      ))}
                      <button onClick={()=>setHelpers([...helpers,{text:"",callout:false}])}
                        style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,width:"100%",height:36,borderRadius:9,border:`1.5px dashed ${A.border2}`,background:"transparent",cursor:"pointer",color:A.t2,fontFamily:FONT,fontSize:12.5,fontWeight:600}}>
                        + 안내 문구 추가
                      </button>
                    </div>
                  })()}
                  {/* 예시 텍스트 — 입력 박스 있는 유형만 */}
                  {((field as any).type==="text"||(field as any).type==="name"||(field as any).type==="phone"||(field as any).type==="email"||(field as any).type==="textarea")&&
                    <div style={{padding:"10px 12px"}}><F label="예시 텍스트" hint="입력 칸 안에 흐리게 표시됩니다" A={A}><TIn value={(field as any).placeholder||""} onChange={v=>patchActiveField(idx,{placeholder:v})} A={A}/></F></div>}
                  {(field as any).type==="info"&&<div style={{padding:"10px 12px"}}>
                    <div style={{fontSize:12.5,fontWeight:600,color:A.t1,marginBottom:4}}>내용</div>
                    <div style={{fontSize:11.5,color:A.t3,lineHeight:1.5,marginBottom:8}}>볼드 · 밑줄 · 링크를 쓸 수 있어요.</div>
                    <ConsentBodyEditor value={(field as any).placeholder||""} onChange={v=>patchActiveField(idx,{placeholder:v})} A={A}/>
                    <div style={{marginTop:12}}>
                      <div style={{fontSize:12.5,fontWeight:600,color:A.t2,marginBottom:8}}>이미지 <span style={{fontWeight:400,color:A.t3}}>선택</span></div>
                      {(field as any).imageUrl
                        ? <div>
                            <div style={{...imagePreviewBoxStyle(field,160),border:`1px solid ${A.border}`,marginBottom:6}}>
                              <img src={(field as any).imageUrl} alt="" style={imagePreviewImgStyle(field)}/>
                              <button onClick={()=>patchActiveField(idx,{imageUrl:"",imageCaption:""})}
                                style={{position:"absolute",top:6,right:6,width:24,height:24,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.5)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,lineHeight:1}}>×</button>
                            </div>
                            {renderImageCropControls(field,()=>openImageCropModal("field",field,(field as any).id),()=>patchActiveField(idx,{imageFit:"contain"}))}
                            <TIn value={(field as any).imageCaption||""} onChange={v=>patchActiveField(idx,{imageCaption:v})} placeholder="이미지 설명 캡션 (선택)" A={A}/>
                          </div>
                        : <div>
                            <label htmlFor={`img_upload_${field.id}`} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,height:40,borderRadius:A.r,border:`1.5px dashed ${A.border}`,background:A.card2,cursor:"pointer",fontSize:12.5,color:A.t3,fontFamily:FONT,transition:"all .15s",fontWeight:500}}
                              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=A.blue;(e.currentTarget as HTMLElement).style.color=A.blue}}
                              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=A.border;(e.currentTarget as HTMLElement).style.color=A.t3}}>
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 11V5M5.5 7.5L8 5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 11.5A2.5 2.5 0 0 0 5.5 14h5A2.5 2.5 0 0 0 13 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                              이미지 파일 업로드
                            </label>
                            <input id={`img_upload_${field.id}`} type="file" accept="image/*" style={{display:"none"}}
                              onChange={async e=>{
                                const file=e.target.files?.[0]
                                if(!file)return
                                try {
                                  const result=await readCompressedImageFile(file)
                                  if(result){
                                    patchActiveField(idx,{imageUrl:result,imageFit:"contain",imagePosX:50,imagePosY:50,imageCropX:0,imageCropY:0,imageCropW:100,imageCropH:100})
                                    setImageNaturalSize("field",result,(field as any).id)
                                  }
                                } catch {
                                  showToast("이미지 업로드에 실패했어요.", false)
                                } finally {
                                  e.target.value=""
                                }
                              }}/>
                          </div>
                      }
                    </div>
                  </div>}
                  {(field as any).type==="ad"&&<div style={{padding:"10px 12px"}}>
                    <F label="광고 소재 방식" A={A}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        {[
                          {key:"image" as AdMode,label:"이미지 배너"},
                          {key:"split" as AdMode,label:"텍스트 + 요소"},
                        ].map(item=>{
                          const selected=((field as any).adMode||"image")===item.key
                          return <button key={item.key} onClick={()=>patchActiveField(idx,{adMode:item.key})}
                            style={{height:34,borderRadius:A.r,border:`1.5px solid ${selected?A.blue:A.border}`,background:selected?A.blue2:A.card2,color:selected?A.blue:A.t2,fontFamily:FONT,fontSize:12.5,fontWeight:selected?700:500,cursor:"pointer"}}>
                            {item.label}
                          </button>
                        })}
                      </div>
                    </F>
                    {((field as any).adMode||"image")==="image"
                      ? <F label="이미지 배너" hint="광고 구좌 전체를 채우는 배너 이미지를 넣습니다." A={A}>
                          {(field as any).imageUrl
                            ? <div>
                                <div style={{...imagePreviewBoxStyle({...field,imageFit:(field as any).imageFit||"cover"},130),border:`1px solid ${A.border}`,marginBottom:6}}>
                                  <img src={(field as any).imageUrl} alt="" style={imagePreviewImgStyle({...field,imageFit:(field as any).imageFit||"cover"})}/>
                                  <button onClick={()=>patchActiveField(idx,{imageUrl:"",imageCaption:""})}
                                    style={{position:"absolute",top:6,right:6,width:24,height:24,borderRadius:"50%",border:"none",background:"rgba(0,0,0,0.5)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,lineHeight:1}}>×</button>
                                </div>
                                {renderImageCropControls(field,()=>openImageCropModal("field",field,(field as any).id),()=>patchActiveField(idx,{imageFit:"contain"}))}
                              </div>
                            : <div>
                                <label htmlFor={`ad_image_upload_${field.id}`} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,height:56,borderRadius:A.r,border:`1.5px dashed ${A.border}`,background:A.card2,cursor:"pointer",fontFamily:FONT,color:A.t3}}>
                                  <span style={{fontSize:12.5,fontWeight:700}}>이미지 파일 업로드</span>
                                  <span style={{fontSize:11,fontWeight:500}}>{AD_IMAGE_SIZE_TEXT}</span>
                                </label>
                                <input id={`ad_image_upload_${field.id}`} type="file" accept="image/*" style={{display:"none"}}
                                  onChange={async e=>{
                                    const file=e.target.files?.[0]
                                    if(!file)return
                                    try {
                                      const result=await readCompressedImageFile(file)
                                      if(result){
                                        patchActiveField(idx,{imageUrl:result,imageFit:"cover",imagePosX:50,imagePosY:50,imageCropX:0,imageCropY:0,imageCropW:100,imageCropH:100})
                                        setImageNaturalSize("field",result,(field as any).id)
                                      }
                                    } catch {
                                      showToast("이미지 업로드에 실패했어요.", false)
                                    } finally {
                                      e.target.value=""
                                    }
                                  }}/>
                              </div>}
                        </F>
                      : <div>
                          <F label="메인 텍스트" A={A}><TArea value={(field as any).adMainText||""} onChange={v=>patchActiveField(idx,{adMainText:v})} minH={44} A={A}/></F>
                          <F label="서브 텍스트" A={A}><TArea value={(field as any).adSubText||""} onChange={v=>patchActiveField(idx,{adSubText:v})} minH={44} A={A}/></F>
                          <F label="오른쪽 요소 텍스트" hint="이미지를 넣으면 텍스트 대신 이미지가 표시됩니다." A={A}><TIn value={(field as any).adElementText||""} onChange={v=>patchActiveField(idx,{adElementText:v})} A={A}/></F>
                          <F label="오른쪽 요소 이미지" hint="투명 PNG나 배경 없는 상품 이미지를 넣으면 더 자연스럽게 보입니다." A={A}>
                            {(field as any).adElementImageUrl
                              ? <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <img src={(field as any).adElementImageUrl} alt="" style={{width:120,height:56,objectFit:"contain",borderRadius:A.r,background:A.card2}}/>
                                  <button onClick={()=>patchActiveField(idx,{adElementImageUrl:""})} style={{height:32,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:"transparent",color:A.t2,fontFamily:FONT,fontSize:12,cursor:"pointer"}}>삭제</button>
                                </div>
                              : <div>
                                  <label htmlFor={`ad_element_upload_${field.id}`} style={{display:"flex",alignItems:"center",justifyContent:"center",height:36,borderRadius:A.r,border:`1.5px dashed ${A.border}`,background:A.card2,cursor:"pointer",fontSize:12.5,color:A.t3,fontFamily:FONT,fontWeight:600}}>이미지 업로드</label>
                                  <input id={`ad_element_upload_${field.id}`} type="file" accept="image/*" style={{display:"none"}}
                                    onChange={async e=>{
                                      const file=e.target.files?.[0]
                                      if(!file)return
                                      try {
                                        const result=await readCompressedImageFile(file)
                                        if(result)patchActiveField(idx,{adElementImageUrl:result})
                                      } catch {
                                        showToast("이미지 업로드에 실패했어요.", false)
                                      } finally {
                                        e.target.value=""
                                      }
                                    }}/>
                                </div>}
                          </F>
                          <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",gap:8,width:"100%"}}>
                            <div style={{minWidth:0}}><F label="배경색" A={A}><CIn value={(field as any).adBg||"#FEE500"} onChange={v=>patchActiveField(idx,{adBg:v})} A={A}/></F></div>
                            <div style={{minWidth:0}}><F label="글자색" A={A}><CIn value={(field as any).adTextColor||"#191919"} onChange={v=>patchActiveField(idx,{adTextColor:v})} A={A}/></F></div>
                          </div>
                        </div>}
                    <F label="클릭 URL" hint="입력하면 실제 폼에서 광고 전체를 누를 수 있습니다." A={A}>
                      <TIn value={(field as any).adHref||""} onChange={v=>patchActiveField(idx,{adHref:v})} placeholder="https://..." A={A}/>
                    </F>
                  </div>}
                  {/* 날짜는 예시 텍스트 없음, 드롭다운은 선택 안내 문구 */}
                  {(field as any).type==="dropdown"&&
                    <div style={{padding:"10px 12px"}}><F label="선택 안내 문구" hint="아무것도 선택하지 않았을 때 표시됩니다" A={A}><TIn value={(field as any).placeholder||"선택해주세요."} onChange={v=>patchActiveField(idx,{placeholder:v})} A={A}/></F></div>}
                  {(field as any).type==="file"&&
                    <div style={{padding:"10px 12px"}}><F label="버튼 안내 문구" hint={FILE_LIMIT_TEXT} A={A}><TIn value={(field as any).placeholder||"파일 업로드"} onChange={v=>patchActiveField(idx,{placeholder:v})} A={A}/></F></div>}
                  {(field as any).type==="date"&&(()=>{
                    const nowYear=new Date().getFullYear()
                    const legacyYear=birthYearLimitOf(field)
                    const enabled=!!((field as any).birthDateRangeEnabled||(field as any).birthYearLimitEnabled)
                    const fallbackStart=`${nowYear-65}-01-01`
                    const fallbackEnd=`${nowYear-55}-12-31`
                    const startValue=normalizeDateOnly((field as any).birthDateRangeStart)||""
                    const endValue=normalizeDateOnly((field as any).birthDateRangeEnd)||(legacyYear?`${legacyYear}-12-31`:"")
                    const summary=birthDateRangeSummary({...field,birthDateRangeEnabled:enabled,birthDateRangeStart:startValue,birthDateRangeEnd:endValue})
                    const summaryForPlaceholder=summary||birthDateRangeSummary({...field,birthDateRangeEnabled:true,birthDateRangeStart:startValue||fallbackStart,birthDateRangeEnd:endValue||fallbackEnd})
                    const datePatchBase={birthDateRangeEnabled:true,birthYearLimitEnabled:false}
                    return <div style={{padding:"10px 12px"}}>
                      <TRow label="생년월일 범위 제한" on={enabled} toggle={()=>patchActiveField(idx,enabled?{birthDateRangeEnabled:false,birthYearLimitEnabled:false}:{...datePatchBase,birthDateRangeStart:startValue||fallbackStart,birthDateRangeEnd:endValue||fallbackEnd})} A={A}/>
                      {enabled&&<div style={{display:"flex",flexDirection:"column",gap:10,padding:"10px 12px",borderRadius:A.r,background:A.card,border:`1px solid ${A.border}`}}>
                        <F label="응답 가능 생년월일" hint="범위 안에 있는 생년월일만 제출할 수 있어요. 시작일과 종료일은 거꾸로 넣어도 자동으로 정리됩니다." A={A}>
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:8,alignItems:"center"}}>
                              <TIn type="date" value={startValue} onChange={v=>patchActiveField(idx,{...datePatchBase,birthDateRangeStart:v})} A={A}/>
                              <span style={{minWidth:74,fontSize:12.5,fontWeight:700,color:startValue?A.blue:A.t3,fontFamily:FONT,whiteSpace:"nowrap" as const}}>{displayBirthDateWithAge(startValue).match(/\((.*?)\)/)?.[1]||"나이 자동"}</span>
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) auto",gap:8,alignItems:"center"}}>
                              <TIn type="date" value={endValue} onChange={v=>patchActiveField(idx,{...datePatchBase,birthDateRangeEnd:v})} A={A}/>
                              <span style={{minWidth:74,fontSize:12.5,fontWeight:700,color:endValue?A.blue:A.t3,fontFamily:FONT,whiteSpace:"nowrap" as const}}>{displayBirthDateWithAge(endValue).match(/\((.*?)\)/)?.[1]||"나이 자동"}</span>
                            </div>
                            <div style={{fontSize:12.5,fontWeight:700,color:A.t1,lineHeight:1.45,padding:"8px 10px",borderRadius:A.r,background:A.card2,border:`1px solid ${A.border}`,wordBreak:"keep-all" as const}}>
                              {summary||"날짜를 설정하면 예: 1961.01.01(만 65세) ~ 1971.12.31(만 55세)처럼 표시됩니다."}
                            </div>
                          </div>
                        </F>
                        <F label="오류 문구" hint="비워두면 자동 문구가 표시됩니다." A={A}>
                          <TIn value={(field as any).birthDateRangeMessage||(field as any).birthYearLimitMessage||""} onChange={v=>patchActiveField(idx,{birthDateRangeMessage:v,birthYearLimitMessage:""})} placeholder={`${summaryForPlaceholder} 출생자만 응답할 수 있어요.`} A={A}/>
                        </F>
                      </div>}
                    </div>
                  })()}
                  {((field as any).type==="dropdown"||(field as any).type==="button_select"||(field as any).type==="checkbox")&&(()=>{
                    return <div style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:8}}>
                        <div>
                          <span style={{fontSize:12.5,fontWeight:600,color:A.t1}}>답변 옵션</span>
                          <div style={{fontSize:11.5,color:A.t3,lineHeight:1.45,marginTop:3}}>옵션 문구는 더블클릭해서 수정할 수 있어요.</div>
                        </div>
                        {((field as any).type==="button_select"||(field as any).type==="checkbox")&&<div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
                          <span style={{fontSize:11.5,fontWeight:600,color:A.t3}}>열</span>
                          <PanelSegment inline value={String((field as any).cols||1)} onChange={v=>patchActiveField(idx,{cols:Number(v)})} A={A}
                            height={26} fontSize={12} trackBg={A===ALT?"#E7EAEF":A.bg}
                            options={[{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"}]}/>
                        </div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column" as const,gap:4,marginBottom:8}}>
                        {((field as any).opts||[]).map((o:any,oi:number)=>{
                          const dragging=optionDrag?.fieldIdx===idx&&optionDrag.optIdx===oi
                          const over=optionDragOver?.fieldIdx===idx&&optionDragOver.optIdx===oi
                          return <div key={oi}
                            onDragOver={e=>{e.preventDefault();e.stopPropagation();setOptionDragOver({fieldIdx:idx,optIdx:oi})}}
                            onDragLeave={e=>{e.stopPropagation();setOptionDragOver(null)}}
                            onDrop={e=>{e.preventDefault();e.stopPropagation();if(optionDrag&&optionDrag.fieldIdx===idx)reorderActiveFieldOption(idx,optionDrag.optIdx,oi);setOptionDrag(null);setOptionDragOver(null);setPanelDragIdx(null);setPanelDragOver(null);setEditIdx(idx)}}
                            style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:A.r,background:A.card,border:`1px solid ${over&&!dragging?A.blue:A.border2}`,fontSize:12,color:A.t1,opacity:dragging?0.45:1,transition:"border-color .12s, opacity .12s"}}>
                            <div draggable data-option-drag-handle="true" title="드래그해서 순서 변경"
                              onMouseDown={e=>{e.stopPropagation();setPanelDragIdx(null);setPanelDragOver(null)}}
                              onClick={e=>e.stopPropagation()}
                              onDragStart={e=>{e.stopPropagation();setPanelDragIdx(null);setPanelDragOver(null);setEditIdx(idx);setOptionDrag({fieldIdx:idx,optIdx:oi});e.dataTransfer.effectAllowed="move";try{e.dataTransfer.setData("text/plain",String(oi))}catch{}}}
                              onDragEnd={e=>{e.stopPropagation();setOptionDrag(null);setOptionDragOver(null);setPanelDragIdx(null);setPanelDragOver(null);setEditIdx(idx)}}
                              style={{width:18,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"grab",color:A.t3,flexShrink:0}}>
                              <DragHandleIcon size={13}/>
                            </div>
                            <span title="더블클릭해서 옵션 문구 수정" onDoubleClick={e=>{const s=e.currentTarget;s.contentEditable="true";s.focus();const r=document.createRange();r.selectNodeContents(s);window.getSelection()?.removeAllRanges();window.getSelection()?.addRange(r)}}
                              onBlur={e=>{e.currentTarget.contentEditable="false";const newOpts=[...((field as any).opts||[])];newOpts[oi]={...newOpts[oi],label:e.currentTarget.textContent||o.label,value:newOpts[oi].value||e.currentTarget.textContent||o.label};patchActiveField(idx,{opts:newOpts})}}
                              onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();(e.currentTarget as HTMLElement).blur()}}}
                              style={{flex:1,fontSize:12.5,color:A.t1,whiteSpace:"pre-wrap" as const,lineHeight:1.4,outline:"none",cursor:"text",borderRadius:3,padding:"1px 2px"}}>{o.label}</span>
                            {!isKdt&&isMultiPage&&<div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                              <span style={{fontSize:10,color:A.t3}}>→</span>
                              <PanelSelect value={o.nextPage?String(o.nextPage):""} A={A} height={24} fontSize={10.5} radius={5} padX={6} width={92}
                                onChange={v=>{const newOpts=[...((field as any).opts||[])];newOpts[oi]={...newOpts[oi],nextPage:v?Number(v):undefined};patchActiveField(idx,{opts:newOpts})}}
                                options={[{value:"",label:"섹션 없음"},...Array.from({length:formPages},(_,pi)=>pi+1).map(p=>({value:String(p),label:getPageLabel(p)})),{value:"9999",label:"설문지 제출"}]}/>
                            </div>}
                            <button onClick={()=>patchActiveField(idx,{opts:((field as any).opts||[]).filter((_:any,i:number)=>i!==oi)})}
                              style={{fontSize:14,color:A.t3,border:"none",background:"none",cursor:"pointer",padding:0,lineHeight:1,display:"flex",alignItems:"center",flexShrink:0}}>×</button>
                          </div>
                        })}
                      </div>
                      <FieldOptAdder fieldIdx={idx} onAdd={(lbl:string,val:string)=>{const cur=(field as any).opts||[];const v=val||lbl;patchActiveField(idx,{opts:[...cur,{label:lbl,value:v,isEtc:lbl==="기타"}]})}} A={A}/>
                    </div>
                  })()}
                  {!isKdt&&isMultiPage&&<div style={{padding:"0 12px 12px"}}>
                    <F label="섹션 지정" A={A}>
                      <PanelSelect value={String((field as any).page||1)} onChange={v=>patchActiveField(idx,{page:Number(v)})} A={A} height={40} fontSize={12.5} radius={9} padX={12}
                        options={Array.from({length:formPages},(_,i)=>i+1).map(p=>({value:String(p),label:getPageLabel(p)}))}/>
                    </F>
                  </div>}
                </div>}
              </div>
            ))}
          </div>
          {/* Add field button — 모든 폼 유형 */}
          <div style={{position:"relative" as const,marginBottom:16}}>
            <button ref={addFieldBtnRef} onClick={()=>{if(showAddField)setShowAddField(false);else openAddFieldMenu()}}
              style={{width:"100%",height:44,borderRadius:11,border:`1.5px dashed ${showAddField?A.blue:A.border2}`,background:showAddField?(adminDark?A.blue2:"#F5F9FF"):"transparent",cursor:"pointer",color:showAddField?A.blue:A.t2,fontFamily:FONT,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .12s"}}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              질문 추가
            </button>
            {showAddField&&<>
            <div onClick={()=>setShowAddField(false)} style={{position:"fixed" as const,inset:0,zIndex:79,background:"transparent"}}/>
            <div style={{position:"fixed" as const,top:addFieldMenuTop,right:rightPanelW+24,zIndex:80,width:320,maxHeight:`calc(100vh - ${addFieldMenuTop + 24}px)`,overflowY:"auto" as const,background:A.card,border:adminDark?`1px solid ${A.border}`:"none",borderRadius:14,padding:8,boxShadow:"0 1px 2px rgba(16,24,40,.08), 0 16px 40px -10px rgba(16,24,40,.28)",display:"grid",gridTemplateColumns:"1fr 1fr",gap:2,alignContent:"start" as const}}>
              {FTYPES_DATA.map(ft=>ft.divider?<div key={ft.type} style={{gridColumn:"1 / -1",height:1,background:A.border,margin:"6px 4px"}}/>:<button key={ft.type} onClick={()=>{
                if(isKdt){
                  const id="kdt_"+Date.now()
                  const adExtra=ft.type==="ad"?{adMode:"image" as AdMode,adMainText:"지금 가장 많이 찾는 프로그램",adSubText:"혜택과 모집 일정을 한눈에 확인해보세요.",adElementText:"자세히 보기",adBg:"#FEE500",adTextColor:"#191919",adHref:"",imageFit:"cover" as const,imagePosX:50,imagePosY:50,imageCropX:0,imageCropY:0,imageCropW:100,imageCropH:100}:{}
                  setCfg(p=>({...p,kdtFields:[...(p.kdtFields||[]),{id,label:ft.type==="ad"?"광고 구좌":"새 질문",type:ft.type as KdtFieldType,page:pvPage,required:false,...adExtra}]}))
                  const newKdtIdx=(cfg.kdtFields||[]).filter((f:any)=>f.page===pvPage).length
                  setEditIdx(newKdtIdx)
                }else{
                  addField(ft.type as FieldType)
                  // Open the newly added field (it'll be at the current page-filtered index)
                  setTimeout(()=>{
                    const pageF=cfg.form.fields.filter(f=>(f.page||1)===pvPage)
                    setEditIdx(pageF.length) // new field appended = becomes last in page
                  },0)
                }
                setShowAddField(false)
              }}
                style={{height:40,display:"flex",alignItems:"center",gap:9,padding:"0 10px",borderRadius:9,border:"none",background:"transparent",cursor:"pointer",color:A.t1,fontFamily:FONT,fontSize:13,fontWeight:600,textAlign:"left" as const,transition:"background .1s"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card2}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                <span style={{color:A.t3,display:"flex",alignItems:"center"}}>{FTYPE_ICONS[ft.type]}</span>
                <span style={{whiteSpace:"nowrap" as const}}>{ft.label}</span>
              </button>)}
            </div>
            </>}
          </div>
          {!isKdt&&<FG title="오류 메시지" A={A} last>
            <F label="중복 신청 안내" A={A}><TArea value={cfg.form.dupText} onChange={v=>uf("dupText",v)} A={A}/></F>
          </FG>}
        </div>
      }

      case "consent": return <div style={pd}>
        <div style={{marginBottom:22}}>
        <F label="동의 위치" hint="폼 시작 부분 또는 제출 직전 중 어디에 동의 섹션을 표시할지 선택합니다." A={A}>
          <PanelSegment value={cfg.form.consentPosition||"end"} A={A}
            onChange={v=>setCfg(p=>({...p,form:{...p.form,consentPosition:v as ConsentPosition}}))}
            options={[{value:"start",label:"맨앞"},{value:"end",label:"맨뒤"}]}/>
        </F>
        </div>
        {cfg.consents.map((cs,idx)=>{
        const consentOpen=openConsentIdx[idx]===true
        const consentSummary=consentLabelForType(cs.consentType||consentTypeFromTitle(cs.title))||cs.title||"동의 유형 미선택"
        return <div key={idx} style={{marginTop:idx>0?18:0,paddingTop:idx>0?18:0,borderTop:idx>0?`1px solid ${A.border}`:"none"}}>
          <div onClick={()=>setOpenConsentIdx(prev=>({...prev,[idx]:!consentOpen}))}
            style={{display:"flex",alignItems:"center",gap:8,marginBottom:consentOpen?9:0,cursor:"pointer",userSelect:"none" as const}}>
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" style={{flexShrink:0,color:A.t3,transform:consentOpen?"none":"rotate(-90deg)",transition:"transform .15s"}}>
              <path d="M2 3.5 5 6.5l3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{fontSize:12,fontWeight:600,color:A.t3,flexShrink:0}}>동의 항목 {idx+1}</span>
            {!consentOpen&&<span style={{minWidth:0,fontSize:12.5,fontWeight:600,color:cs.enabled?A.t1:A.t3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{consentSummary}</span>}
            {!consentOpen&&!cs.enabled&&<span style={{flexShrink:0,padding:"2px 7px",borderRadius:6,background:panelFieldBg(A),color:A.t3,fontSize:10.5,fontWeight:700,letterSpacing:".3px"}}>OFF</span>}
            <div style={{flex:1}}/>
            <span onClick={e=>e.stopPropagation()} style={{display:"flex",flexShrink:0}}>
              <PanelCheckRow label="필수 동의" on={!!cs.required} toggle={()=>uc(idx,"required",!cs.required)} A={A}/>
            </span>
            {idx===0&&<span title="기본 동의 항목이라 삭제할 수 없어요" style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11.5,fontWeight:600,color:A.t3,fontFamily:FONT}}>기본</span>}
            {idx>0&&<button onClick={e=>{e.stopPropagation();removeConsent(idx)}} title="동의 항목 삭제" aria-label="동의 항목 삭제"
              style={{width:30,height:30,borderRadius:8,border:"none",background:"transparent",color:A.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=panelFieldBg(A);(e.currentTarget as HTMLElement).style.color=A.red}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color=A.t3}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M9.5 4.5h5a1 1 0 0 1 1 1V7h-7V5.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M6 7.5h12l-.85 11.1a1.5 1.5 0 0 1-1.5 1.4H8.35a1.5 1.5 0 0 1-1.5-1.4L6 7.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </button>}
          </div>
          {consentOpen&&<>
          <TRow label="동의 섹션 표시" on={cs.enabled} toggle={()=>uc(idx,"enabled",!cs.enabled)} A={A}/>
          <F label="동의 유형 선택" A={A}>
            <PanelSelect value={cs.consentType||""} placeholder="동의 유형을 선택해주세요" height={46} A={A}
              options={CONSENT_TYPES.map(ct=>({value:ct.key,label:ct.label}))}
              onChange={nextType=>{
                const ct=CONSENT_TYPES.find(c=>c.key===nextType)
                const nextPolicyUrl=policyUrlForConsent(nextType,currentBrand)
                patchConsent(idx,{
                  consentType:nextType,
                  ...(ct?{title:ct.label}:{}),
                  ...(cs.policyMode==="custom"?{}:{policyUrl:nextPolicyUrl}),
                  ...(cs.policyMode==="custom"&&!cs.customPolicyTitle&&ct?{customPolicyTitle:ct.label}:{}),
                })
              }}/>
          </F>
          <F label="법적 문서" hint="브랜드 기본 문서를 쓰거나, 이 폼 전용 문서를 직접 작성할 수 있어요." A={A}>
            {(()=>{
              const type=cs.consentType||consentTypeFromTitle(cs.title)
              const autoUrl=type?policyUrlForConsent(type,currentBrand):""
              const policyMode=cs.policyMode==="custom"?"custom":"brand"
              const resolvedUrl=autoUrl||cs.policyUrl||""
              const customBody=String(cs.customPolicyBody||"").trim()
              return <div style={{display:"flex",flexDirection:"column" as const,gap:9,fontFamily:FONT}}>
                <PanelSegment value={policyMode} A={A}
                  options={[{value:"brand",label:"브랜드 기본 문서"},{value:"custom",label:"직접 작성 문서"}]}
                  onChange={v=>{
                    if(v==="brand"){
                      patchConsent(idx,{policyMode:"brand",policyUrl:autoUrl||cs.policyUrl||""})
                    }else{
                      patchConsent(idx,{
                        policyMode:"custom",
                        customPolicyTitle:cs.customPolicyTitle||consentLabelForType(type)||cs.title||"법적 문서",
                        customPolicyBody:cs.customPolicyBody||cs.body||"",
                      })
                    }
                  }}/>
                {policyMode==="brand"
                  ? <div style={{border:"none",borderRadius:10,background:panelFieldBg(A),padding:"13px 14px",boxShadow:resolvedUrl?"none":`inset 0 0 0 1.5px ${A.red}`}}>
                      <div style={{fontSize:13,fontWeight:700,color:resolvedUrl?A.t1:A.red}}>
                        {type?consentLabelForType(type):"동의 유형을 먼저 선택해주세요"}
                      </div>
                      {resolvedUrl
                        ? <a href={resolvedUrl} target="_blank" rel="noopener" style={{display:"block",marginTop:6,fontSize:12.5,color:A.blue,textDecoration:"none",wordBreak:"break-all"}}>{resolvedUrl}</a>
                        : <div style={{marginTop:6,fontSize:12.5,color:A.red}}>동의 유형 선택 시 자동으로 연결됩니다.</div>}
                    </div>
                  : <div style={{display:"flex",flexDirection:"column" as const,gap:9}}>
                      <TIn value={cs.customPolicyTitle||consentLabelForType(type)||cs.title||"법적 문서"} onChange={v=>uc(idx,"customPolicyTitle",v)} placeholder="문서 제목" A={A}/>
                      <ConsentBodyEditor value={cs.customPolicyBody||""} onChange={v=>uc(idx,"customPolicyBody",v)} A={A}/>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                        <div style={{fontSize:11.5,color:customBody?A.t3:A.red,lineHeight:1.45}}>
                          {customBody?"보기 버튼을 누르면 작성한 문서 페이지가 열립니다.":"문서 내용을 작성하면 폼의 보기 버튼이 표시됩니다."}
                        </div>
                        {customBody&&<button onClick={()=>openCustomPolicyPreview(cs)} style={{height:30,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.blue}44`,background:"transparent",color:A.blue,fontFamily:FONT,fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>미리보기</button>}
                      </div>
                    </div>}
              </div>
            })()}
          </F>
          <F label="본문" A={A}>
            <ConsentBodyEditor value={cs.body} onChange={v=>uc(idx,"body",v)} A={A}/>
          </F>
          <F label="체크박스 라벨" A={A}><TIn value={cs.checkLabel} onChange={v=>uc(idx,"checkLabel",v)} A={A}/></F>
          </>}
        </div>})}
        <button onClick={addConsent}
          style={{width:"100%",height:46,borderRadius:11,border:`1.5px dashed ${A.border2}`,background:"transparent",cursor:"pointer",color:A.t2,fontFamily:FONT,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:18}}>
          <span style={{fontSize:16,lineHeight:1}}>+</span> 동의 항목 추가
        </button>
      </div>

      case "login": return <div style={pd}>
        <FG title="로그인 설정" A={A} last>
          <TRow label="로그인 필수" on={cfg.auth.enabled} toggle={()=>ua("enabled",!cfg.auth.enabled)} A={A}/>
          <F label="에러 메시지" A={A}><TIn value={cfg.auth.errText} onChange={v=>ua("errText",v)} A={A}/></F>
        </FG>
      </div>

      case "integrations": {
        const gs={...DEFAULT_GOOGLE_SHEETS,...(cfg.integrations?.googleSheets||{})}
        const effectiveWebhookUrl=String(gs.webhookUrl||googleSheetsWebhookUrl||"").trim()
        const usingGlobalWebhook=!String(gs.webhookUrl||"").trim()&&!!googleSheetsWebhookUrl
        const ready=!!gs.enabled&&!!effectiveWebhookUrl
        const statusLabel=!gs.enabled?"연동 꺼짐":!effectiveWebhookUrl?"설정 필요":gs.lastSyncStatus==="sent"?"전송 요청 완료":gs.lastSyncStatus==="error"?"최근 전송 실패":"연동 대기"
        const statusColor=!gs.enabled?A.t3:!effectiveWebhookUrl?A.red:gs.lastSyncStatus==="error"?A.red:A.green
        const lastSyncText=gs.lastSyncAt?new Date(gs.lastSyncAt).toLocaleString("ko-KR"):"아직 제출 전송 기록이 없어요."
        const sheetOpenUrl=googleSheetOpenUrl(gs)
        const syncMessageRaw=String(gs.lastSyncMessage||"")
        const syncMessage=/<!doctype html|<html[\s>]|Google Drive|unable to open the file|Page Not Found/i.test(syncMessageRaw)
          ?"Google Drive/Docs 오류 페이지가 응답했어요. Apps Script Web App URL이 `https://script.google.com/macros/s/.../exec` 형식인지 확인해주세요."
          :syncMessageRaw
        return <div style={pd}>
          <div style={{display:"flex",flexDirection:"column" as const,gap:16}}>
            {/* 상태 카드 — 토글 · 설명 · 연동 상태를 한 덩어리로 */}
            <div style={{padding:14,borderRadius:11,background:panelFieldBg(A)}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                <span style={{fontSize:13.5,fontWeight:700,color:A.t1}}>응답 자동 연동</span>
                <div onClick={()=>ug("enabled",!gs.enabled)} style={{width:44,height:25,borderRadius:13,background:gs.enabled?A.blue:(A===ALT?"#DFE3E9":A.border2),position:"relative" as const,transition:"background .2s",cursor:"pointer",flexShrink:0}}>
                  <div style={{position:"absolute" as const,width:19,height:19,borderRadius:"50%",background:"#fff",top:3,left:gs.enabled?22:3,transition:"left .2s",boxShadow:"0 1px 3px rgba(16,24,40,0.24)"}}/>
                </div>
              </div>
              <div style={{fontSize:12.5,color:A.t3,lineHeight:1.6,marginTop:6}}>제출된 응답을 구글 스프레드시트로 자동 전송합니다.</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12,paddingTop:12,boxShadow:`inset 0 1px 0 ${A.border}`}}>
                <span style={{width:6,height:6,borderRadius:3,background:statusColor,flexShrink:0}}/>
                <span style={{flex:1,minWidth:0,fontSize:12.5,fontWeight:600,color:statusColor}}>{statusLabel}</span>
                <button onClick={()=>sheetOpenUrl?window.open(sheetOpenUrl,"_blank","noopener,noreferrer"):showToast(gs.mode==="new"?"테스트 전송 후 생성된 시트 링크가 저장되면 이동할 수 있어요.":"연결할 시트 링크를 입력하면 바로 이동할 수 있어요.",false)}
                  style={{height:28,padding:"0 10px",borderRadius:7,border:"none",background:A.card,color:sheetOpenUrl?A.t2:A.t3,fontFamily:FONT,fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>
                  시트로 이동
                </button>
              </div>
              <div style={{fontSize:11.5,color:A.t3,lineHeight:1.6,marginTop:8}}>
                {ready?`마지막 상태: ${lastSyncText}`:"계정 이메일만으로는 연동되지 않아요. 공통 Apps Script URL을 Vercel 환경변수에 넣거나, 고급 설정에서 이 폼에 직접 URL을 입력해야 응답이 시트로 전송됩니다."}
                {syncMessage&&<div style={{marginTop:4,color:gs.lastSyncStatus==="error"?A.red:A.t3}}>{syncMessage}</div>}
              </div>
            </div>

            <F label="전송 대상" A={A}>
              <PanelSegment value={gs.mode} onChange={v=>ug("mode",v as "existing"|"new")} A={A}
                options={[{value:"existing",label:"기존 시트"},{value:"new",label:"새로 생성"}]}/>
            </F>

            <F label="연동 계정" A={A}><TIn value={gs.accountEmail} onChange={v=>ug("accountEmail",v)} placeholder="google@example.com" A={A}/></F>

            <F label={gs.mode==="existing"?"시트 링크":"생성할 시트 이름"} A={A}>
              <TIn value={gs.mode==="existing"?gs.sheetUrl:gs.sheetName} onChange={v=>gs.mode==="existing"?ug("sheetUrl",v):ug("sheetName",v)} placeholder={gs.mode==="existing"?"https://docs.google.com/spreadsheets/d/...":"예) 5월 신청 응답"} A={A}/>
            </F>

            {/* 고급 설정 — Apps Script URL은 잘못 건드리면 연동이 끊기므로 기본으로 접어둔다 */}
            <div>
              <button onClick={()=>setSyncAdvOpen(v=>!v)}
                style={{width:"100%",height:44,display:"flex",alignItems:"center",gap:8,padding:"0 14px",borderRadius:10,border:"none",background:panelFieldBg(A),color:A.t1,fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>
                <span style={{flex:1,textAlign:"left" as const}}>고급 설정</span>
                <span style={{fontSize:11.5,color:A.t3,fontWeight:500}}>{usingGlobalWebhook?"공통 URL 자동 적용 중":effectiveWebhookUrl?"폼 전용 URL 사용 중":"URL 미설정"}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{flexShrink:0,color:A.t3,transform:syncAdvOpen?"none":"rotate(-90deg)",transition:"transform .15s"}}>
                  <path d="M2 3.5 5 6.5l3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {syncAdvOpen&&<div style={{marginTop:9}}>
                <F label="Apps Script Web App URL" A={A}>
                  <TIn value={gs.webhookUrl} onChange={v=>ug("webhookUrl",v)} placeholder="https://script.google.com/macros/s/..." A={A}/>
                  <div style={{fontSize:12,color:A.t3,lineHeight:1.6,marginTop:7}}>
                    {usingGlobalWebhook?"Vercel 공통 URL이 자동 적용 중이에요. 이 폼만 다른 URL을 써야 할 때 입력하세요.":"이 폼만 다른 URL을 써야 할 때 입력하세요."}
                  </div>
                </F>
              </div>}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,paddingTop:2}}>
              <button onClick={()=>loadedId?updateCfg(false):setShowSave(true)}
                style={{height:44,borderRadius:10,border:`1px solid ${A===ALT?"#E3E7EC":A.border}`,background:A.card,color:A.t2,fontFamily:FONT,fontSize:13,fontWeight:600,cursor:"pointer"}}>
                설정 저장
              </button>
              <button onClick={testGoogleSheetsIntegration}
                style={{height:44,borderRadius:10,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                테스트 전송
              </button>
            </div>
          </div>
          <div style={{marginTop:16,padding:"12px 14px",borderRadius:10,background:panelFieldBg(A),border:"none",color:A.t2,fontSize:12.5,lineHeight:1.7}}>
            이 설정은 <b>설정 저장</b> 또는 우측 상단 <b>저장</b>을 눌러야 실제 배포된 폼에 반영돼요. 저장 후 <b>테스트 전송</b>을 눌러 시트에 테스트 행이 생기는지 먼저 확인해주세요.
          </div>
        </div>
      }

      case "slug": {
        const slugHasInvalidChars=hasInvalidSlugChars(slugDraft)
        const preview=slugDraft&&!slugHasInvalidChars?buildPublicFormUrl(normalizeSlug(slugDraft)):""
        return <div style={pd}>
          <FG title="폼 슬러그" A={A} last>
            <F label="슬러그" A={A}>
              <TIn value={slugDraft} onChange={v=>setSlugDraft(v)} placeholder="my-form-slug" A={A}/>
              <div style={{marginTop:8,fontSize:12.5,lineHeight:1.6,color:slugHasInvalidChars?A.red:A.t3}}>
                한글, 공백, 특수문자는 사용할 수 없어요. 영문, 숫자, 하이픈(-)만 입력해주세요.
              </div>
            </F>
            {preview&&<F label="미리보기 URL" A={A}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"13px 14px",borderRadius:10,background:panelFieldBg(A),border:"none"}}>
                <span style={{flex:1,minWidth:0,fontFamily:FONT,fontSize:12.5,color:A.t3,lineHeight:1.6,wordBreak:"break-all" as const}}>{preview}</span>
                <button onClick={()=>{navigator.clipboard?.writeText(preview).then(()=>showToast("미리보기 URL을 복사했어요.")).catch(()=>showToast("복사에 실패했어요.",false))}}
                  title="URL 복사" aria-label="URL 복사"
                  style={{width:30,height:30,flexShrink:0,border:"none",borderRadius:8,background:A.card,color:A.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=A.blue}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color=A.t3}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="9" y="9" width="11" height="11" rx="2.6" stroke="currentColor" strokeWidth="1.7"/>
                    <path d="M15 5.5A1.5 1.5 0 0 0 13.5 4h-8A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </F>}
            <button onClick={updateFormSlug} style={{width:"100%",height:50,borderRadius:11,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:14,fontWeight:700,cursor:"pointer"}}>
              {loadedId?"슬러그 저장":"저장 전 슬러그 적용"}
            </button>
          </FG>
        </div>
      }

      case "qr": {
        const base=getBrandFormBaseUrl()
        const hasBase=base.length>0
        const hasSaved=savedSlug.length>0
        const formUrl=hasSaved?buildPublicFormUrl(savedSlug):""
        const activeQrUrl=qrMode==="form"?formUrl:qrCustomUrl.trim()
        const qrName=qrMode==="form"?`${loadedName||savedSlug||"catchform"}-form-qr`:"detail-page-qr"
        const trackerBase=typeof window!=="undefined"?window.location.origin:""
        const qrLabel=loadedName||savedSlug||(qrMode==="form"?"폼 QR":"상세페이지 QR")
        const qrBrand=currentBrand==="SNIPERFACTORY"?"sf":currentBrand==="INSIDEOUT"?"io":currentBrand==="SFACSPACE"?"sp":""
        const compactLoadedId=compactFormId(loadedId)
        const qrFormRef=compactLoadedId?`i=${encodeURIComponent(compactLoadedId)}`:`s=${encodeURIComponent(savedSlug||"")}`
        const existingQrLinks=Array.isArray(cfg.integrations?.qrLinks)?cfg.integrations!.qrLinks!:[]
        const savedDetailQrLink=existingQrLinks.find(link=>link.type==="detail"&&link.code)
        const customQrCode=qrMode==="custom"&&activeQrUrl
          ? savedDetailQrLink?.code||compactQrCode(`${loadedId||savedSlug||"detail"}|detail`)
          :""
        const canUseShortCustomQr=!!(loadedId&&supa&&customQrCode)
        const trackedQrUrl=activeQrUrl&&trackerBase
          ? qrMode==="form"
            ? `${trackerBase}/qr?${qrFormRef}${qrBrand?`&b=${qrBrand}`:""}`
            : canUseShortCustomQr
              ? `${trackerBase}/qr?${qrFormRef}&q=${encodeURIComponent(customQrCode)}${qrBrand?`&b=${qrBrand}`:""}&d=1`
              : `${trackerBase}/qr?u=${encodeURIComponent(activeQrUrl)}${savedSlug?`&s=${encodeURIComponent(savedSlug)}`:""}${qrBrand?`&b=${qrBrand}`:""}&d=1`
          : activeQrUrl
        const formQrCode=savedSlug||loadedId?compactQrCode(`${savedSlug||loadedId}|form`):""
        const persistedQrLink=qrMode==="form"
          ? existingQrLinks.find(link=>link.type==="form"&&link.code===formQrCode&&link.url===activeQrUrl)
          : existingQrLinks.find(link=>link.type==="detail"&&link.code===customQrCode)
        const detailQrTargetChanged=qrMode==="custom"&&!!savedDetailQrLink&&savedDetailQrLink.url!==activeQrUrl
        const qrMatrix=qrGeneratedUrl===trackedQrUrl?qrGeneratedMatrix:(persistedQrLink?safeMakeQrMatrix(trackedQrUrl):null)
        const qrError=qrGeneratedUrl===trackedQrUrl?qrGeneratedError:""
        const ensureQrLinkSaved=async()=>{
          if(!loadedId||!supa||!activeQrUrl)return
          if(qrMode==="custom"&&(!canUseShortCustomQr||!customQrCode))return
          const code=qrMode==="form"?formQrCode:customQrCode
          if(!code)return
          const type=qrMode==="form"?"form":"detail"
          const existing=Array.isArray(cfg.integrations?.qrLinks)?cfg.integrations!.qrLinks!:[]
          const current=existing.find(link=>link.code===code&&link.type===type)
          if(current?.url===activeQrUrl)return
          const link:QrLink={code,url:activeQrUrl,label:qrLabel,type,createdAt:new Date().toISOString()}
          const nextCfg:Cfg=applyBrandDefaults({
            ...cfg,
            brand:currentBrand,
            integrations:{
              ...(cfg.integrations||{}),
              googleSheets:{...DEFAULT_GOOGLE_SHEETS,...(cfg.integrations?.googleSheets||{})},
              qrLinks:[link,...existing.filter(item=>!(item.code===code&&item.type===type))].slice(0,80),
            },
          },currentBrand)
          setCfg(nextCfg)
          if(loadedId){
            const updatedAt=new Date().toISOString()
            fullFormCache.current[loadedId]={updatedAt,data:{config:nextCfg,slug:savedSlug,name:loadedName,brand:currentBrand}}
            const {error}=await supa!.from("form_configs").update({config:nextCfg,brand:dbBrandValue(currentBrand),updated_at:updatedAt}).eq("id",loadedId)
            if(error)throw error
          }
        }
        const onQrGenerate=async()=>{
          try{
            if(!activeQrUrl){showToast(qrMode==="form"?"폼 링크가 먼저 필요해요":"상세페이지 URL을 입력해주세요",false);return}
            await ensureQrLinkSaved()
            setQrGeneratedMatrix(makeQrMatrix(trackedQrUrl))
            setQrGeneratedUrl(trackedQrUrl)
            setQrGeneratedError("")
            showToast(detailQrTargetChanged?"기존 QR의 이동 링크를 변경했어요":"QR 미리보기를 생성했어요")
          }catch(e){
            setQrGeneratedMatrix(null)
            setQrGeneratedUrl(trackedQrUrl)
            setQrGeneratedError((e as Error).message||"QR을 만들 수 없어요.")
            showToast((e as Error).message||"QR 생성에 실패했어요",false)
          }
        }
        const onQrDownload=async(format:QrFileFormat)=>{
          try{
            if(!activeQrUrl){showToast(qrMode==="form"?"폼 링크가 먼저 필요해요":"상세페이지 URL을 입력해주세요",false);return}
            if(!qrMatrix){showToast("먼저 QR 생성 버튼을 눌러주세요.",false);return}
            await ensureQrLinkSaved()
            downloadQrFile(trackedQrUrl,qrName,format)
            showToast(`${format.toUpperCase()} QR 다운로드를 시작했어요`)
          }catch(e){showToast((e as Error).message||"QR 다운로드에 실패했어요",false)}
        }
        return <div style={pd}>
          <FG title="QR 만들기" A={A}>
            <div style={{marginBottom:16}}>
              <PanelSegment value={qrMode} onChange={v=>setQrMode(v as "form"|"custom")} A={A}
                options={[{value:"form",label:"폼 QR"},{value:"custom",label:"상세페이지 QR"}]}/>
            </div>
            <F label={qrMode==="form"?"폼 URL":"상세페이지 URL"} A={A}>
              {qrMode==="form"
                ? formUrl
                  ? <div style={{padding:"13px 14px",borderRadius:10,background:panelFieldBg(A),border:"none",fontFamily:FONT,fontSize:12.5,color:A.t3,lineHeight:1.6,wordBreak:"break-all" as const}}>{formUrl}</div>
                  : <div style={{padding:"13px 14px",borderRadius:10,background:panelFieldBg(A),border:"none",fontSize:12.5,color:A.t3,lineHeight:1.6}}>
                      {!hasBase&&!hasSaved?"배포 페이지 URL과 저장된 슬러그가 필요해요.":!hasBase?"브랜드별 배포 페이지 URL이 필요해요.":"폼을 먼저 저장하면 QR을 만들 수 있어요."}
                    </div>
                : <TIn value={qrCustomUrl} onChange={setQrCustomUrl} placeholder="https://example.com/detail" A={A}/>}
              {qrMode==="custom"&&qrCustomUrl.trim()&&!/^https?:\/\//i.test(qrCustomUrl.trim())&&
                <div style={{marginTop:6,fontSize:11.5,color:A.t3,lineHeight:1.5}}>
                  `https://`를 포함한 전체 URL을 입력하면 스캔 시 바로 열립니다.
                  </div>}
              {activeQrUrl&&<div style={{marginTop:7,fontSize:11.5,color:A.t3,lineHeight:1.5}}>
                {qrMode==="custom"
                  ?"URL을 변경해도 기존 QR 이미지는 유지되고 이동할 링크만 바뀝니다."
                  :"QR 스캔은 응답 및 분석의 QR 데이터 탭에 기록됩니다."}
              </div>}
            </F>
          </FG>

          <FG title="미리보기 / 다운로드" A={A} last>
            <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:14}}>
              <div style={{width:"100%",aspectRatio:"1",borderRadius:14,background:adminDark?A.card2:"#FAFBFC",border:"none",boxShadow:`inset 0 0 0 1px ${A.border}`,display:"flex",alignItems:"center",justifyContent:"center",padding:24,boxSizing:"border-box" as const}}>
                {qrMatrix
                  ? <div style={{width:"100%",maxWidth:212,aspectRatio:"1"}} dangerouslySetInnerHTML={{__html:qrMatrixToSvgMarkup(qrMatrix,212)}}/>
                  : <div style={{textAlign:"center" as const,color:A.t3,fontSize:13,lineHeight:1.6,wordBreak:"keep-all" as const}}>
                      {qrError||<>QR 생성 버튼을 누르면<br/>미리보기가 표시됩니다.</>}
                    </div>}
              </div>
              <button onClick={onQrGenerate} disabled={!activeQrUrl}
                style={{width:"100%",height:48,borderRadius:11,border:"none",background:activeQrUrl?A.blue:A.border2,color:"#fff",fontFamily:FONT,fontSize:13.5,fontWeight:700,cursor:activeQrUrl?"pointer":"not-allowed"}}>
                {detailQrTargetChanged?"링크 변경 저장":qrMatrix?"QR 다시 생성":"QR 생성"}
              </button>
              {qrError&&<div style={{fontSize:12,color:A.red,lineHeight:1.5,textAlign:"center" as const}}>{qrError}</div>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,width:"100%"}}>
                {(["png","svg","jpg"] as QrFileFormat[]).map(format=>(
                  <button key={format} onClick={()=>onQrDownload(format)} disabled={!qrMatrix}
                    style={{height:44,borderRadius:10,border:"none",background:qrMatrix?panelFieldBg(A):(A===ALT?"#F1F3F6":A.card2),color:qrMatrix?A.t1:A.t4,fontFamily:FONT,fontSize:12.5,fontWeight:700,cursor:qrMatrix?"pointer":"not-allowed",textTransform:"uppercase" as const}}>
                    {format}
                  </button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,width:"100%"}}>
                <button onClick={()=>{if(activeQrUrl){navigator.clipboard.writeText(activeQrUrl);showToast("QR URL 복사 완료!")}}} disabled={!activeQrUrl}
                  style={{height:44,borderRadius:10,border:`1px solid ${A===ALT?"#E3E7EC":A.border}`,background:A.card,color:activeQrUrl?A.t2:A.t3,fontFamily:FONT,fontSize:13,fontWeight:600,cursor:activeQrUrl?"pointer":"not-allowed"}}>
                  URL 복사
                </button>
                <button onClick={()=>activeQrUrl&&window.open(activeQrUrl,"_blank")} disabled={!activeQrUrl}
                  style={{height:44,borderRadius:10,border:`1px solid ${A===ALT?"#E3E7EC":A.border}`,background:A.card,color:activeQrUrl?A.t2:A.t3,fontFamily:FONT,fontSize:13,fontWeight:600,cursor:activeQrUrl?"pointer":"not-allowed"}}>
                  URL 열기
                </button>
              </div>
            </div>
          </FG>
        </div>
      }

      case "cta": return <div style={pd}>
        <FG title="텍스트" A={A}><F label="버튼 라벨" A={A}><TIn value={cfg.cta.label} onChange={v=>ut("label",v)} A={A}/></F><F label="로딩 중 라벨" A={A}><TIn value={cfg.cta.loadLabel} onChange={v=>ut("loadLabel",v)} A={A}/></F></FG>
        <FG title="크기 / 색상" A={A} last>
          <F label="높이 (px)" A={A}><Slider value={cfg.cta.height} min={40} max={64} onChange={v=>ut("height",v)} A={A}/></F>
          <F label="배경색" A={A}><CIn value={cfg.cta.bg} onChange={v=>ut("bg",v)} A={A}/></F>
          <F label="텍스트 색상" A={A}><CIn value={cfg.cta.color} onChange={v=>ut("color",v)} A={A}/></F>
        </FG>
      </div>

      case "modal": {
        const shareButtons={...DEFAULT_MODAL_SHARE_BUTTONS,...(cfg.modal.shareButtons||{})}
        const shareOptions:{key:ModalShareKey;label:string}[]=[
          {key:"kakao",label:"카카오톡"},
          {key:"instagram",label:"인스타그램"},
          {key:"threads",label:"스레드"},
          {key:"x",label:"X"},
          {key:"link",label:"URL 복사"},
        ]
        return <div style={pd}>
        <FG A={A}>
          <F label="제목" A={A}><TIn value={cfg.modal.title} onChange={v=>um("title",v)} A={A}/></F>
          <F label="본문" A={A}><TArea value={cfg.modal.body} onChange={v=>um("body",v)} A={A}/></F>
          <F label="버튼 텍스트" A={A}><TIn value={cfg.modal.btnLabel} onChange={v=>um("btnLabel",v)} A={A}/></F>
          <F label="버튼 클릭 후 URL" A={A}><TIn value={cfg.modal.btnUrl} onChange={v=>um("btnUrl",v)} placeholder="https://..." A={A}/></F>
        </FG>
        <FG title="공유 버튼" A={A} last>
          <div style={{fontSize:12.5,color:A.t3,lineHeight:1.6,margin:"6px 0 10px"}}>
            완료 모달에 표시할 공유 버튼을 선택합니다.
          </div>
          {shareOptions.map(({key,label})=>(
            <TRow key={key} label={label} on={!!shareButtons[key]} toggle={()=>umShare(key,!shareButtons[key])} A={A}/>
          ))}
        </FG>
      </div>
      }

      case "styles": return <div style={pd}>
        <FG title="시니어 모드" A={A}>
          <TRow label="시니어 모드 활성화" on={!!cfg.styles.seniorMode} toggle={()=>us("seniorMode",!cfg.styles.seniorMode)} A={A}/>
          <div style={{fontSize:12.5,color:A.t3,lineHeight:1.6,marginTop:9}}>
            고령자가 더 쉽게 읽고 입력할 수 있도록 폰트와 입력 영역을 키우고, 글씨 색을 검정에 가깝게 표시합니다.
          </div>
        </FG>
        <FG title="폼 테마" A={A}>
          {cfg.styles.seniorMode&&<div style={{fontSize:12.5,color:A.t3,lineHeight:1.6,marginBottom:10}}>
            시니어 모드가 켜져 있어도 테마와 입력 박스 색은 유지되고, 글자색과 크기만 가독성 중심으로 바뀝니다.
          </div>}
          <PanelSegment value={cfg.styles.theme} onChange={v=>us("theme",v as Theme)} A={A} height={42}
            options={[
              {value:"light",label:"라이트",icon:<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5 3.4 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>},
              {value:"dark",label:"다크",icon:<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><path d="M13.5 8.5A5.5 5.5 0 0 1 7 2a6 6 0 1 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>},
            ]}/>
        </FG>
        <FG title="브랜드 컬러" A={A}>
          <PanelSegment value={cfg.cta.bg} onChange={v=>ut("bg",v)} A={A} height={42}
            options={[{c:"#529DFF",l:"스나이퍼팩토리"},{c:"#EA594D",l:"인사이드아웃"}].map(({c,l})=>({
              value:c,label:l,
              icon:<span style={{width:18,height:18,borderRadius:9,background:c,flexShrink:0,display:"block"}}/>,
            }))}/>
        </FG>
        <FG title="CTA 버튼 색상" A={A}>
          <F label="배경색" A={A}>
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              {[{c:"#529DFF",l:"SF"},{c:"#EA594D",l:"IO"},{c:"#3182F6",l:"기본"}].map(({c,l})=>(
                <button key={c} onClick={()=>ut("bg",c)} title={l} style={{width:32,height:32,borderRadius:9,background:c,border:"none",boxShadow:cfg.cta.bg===c?`inset 0 0 0 2px #fff, 0 0 0 2px ${A.blue}`:"none",cursor:"pointer",flexShrink:0}}/>
              ))}
            </div>
            <CIn value={cfg.cta.bg} onChange={v=>ut("bg",v)} A={A}/>
          </F>
        </FG>
        <FG title="레이아웃" A={A} last>
          <F label="최대 너비" A={A}><Slider value={cfg.styles.maxW} min={320} max={980} step={10} onChange={v=>us("maxW",v)} A={A}/></F>
          <F label="필드 높이" A={A}><Slider value={cfg.styles.fieldH} min={32} max={72} onChange={v=>us("fieldH",v)} A={A}/></F>
          <F label="질문 항목 간격" A={A}><Slider value={cfg.styles.qGap} min={0} max={48} onChange={v=>us("qGap",v)} A={A}/></F>
          <F label="질문-답변 간격" A={A}><Slider value={cfg.styles.labelGap??8} min={2} max={24} onChange={v=>us("labelGap",v)} A={A}/></F>
        </FG>
      </div>



      default: return null
    }
  }

  // ── Preview ───────────────────────────────────────────────────────────
  const fInp:React.CSSProperties={width:"100%",height:fh,background:FC.fieldBg,border:`1px solid ${FC.fieldBorder}`,borderRadius:fr,color:FC.t1,fontFamily:FONT,fontSize:13,padding:"0 13px",outline:"none",boxSizing:"border-box" as const}
  // pvSel removed - handled per-field in FieldInput
  const tuiDisp=cfg.header.tuitionFree?(cfg.header.tuitionFreeText||"수강료 전액 무료"):(cfg.header.tuitionAmount?`${cfg.header.tuitionAmount}원`:"")

  function renderPreview() {
    if(isKdt) return renderKdtPreview()
    const fields:any[] = (cfg.form.fields||[]).filter((f:any)=>(f.page||1)===pvPage)
    const allFieldsForPreview = fields
    const fh = seniorFieldHeight(seniorMode,cfg.styles.fieldH||44)
    const fr2 = seniorMode?"10px":cfg.styles.theme==="dark"?"6px":"8px"
    const qg = seniorGap(seniorMode,cfg.styles.qGap||16)
    const validateEmail=(v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    const validatePhone=(v:string)=>/^01[0-9]-\d{3,4}-\d{4}$/.test(v)
    const setError=(id:string,msg:string)=>setPvFieldErrors(p=>({...p,[id]:msg}))
    const clearError=(id:string)=>setPvFieldErrors(p=>{const n={...p};delete n[id];return n})


    return <div style={{flex:1,display:"flex",justifyContent:"center",padding:0,background:"transparent","--link-color":accentBg} as React.CSSProperties}>
      <div style={{width:"100%",maxWidth:cfg.styles.maxW,fontFamily:FONT,padding:seniorMode?"44px 34px 48px":"36px 34px 32px",borderRadius:14,background:FC.bg,boxShadow:cfg.styles.theme==="dark"?"0 1px 2px rgba(0,0,0,.18), 0 12px 32px -20px rgba(0,0,0,.6)":ALT.shadow,height:"fit-content",boxSizing:"border-box" as const}}>
        {cfg.header.imageUrl&&<div style={{...imagePreviewBoxStyle(cfg.header,200),borderRadius:fr2,marginBottom:22,background:FC.fieldBg}}>
          <img src={cfg.header.imageUrl} alt="" style={imagePreviewImgStyle(cfg.header)}/>
        </div>}
        <div style={{textAlign:"center" as const,marginBottom:22}}>
          {cfg.header.overline&&<div style={{fontSize:fs(12.5),fontWeight:700,color:accentText,marginBottom:8,textAlign:"center" as const}}>{cfg.header.overline}</div>}
          <div style={{fontSize:fs(26),fontWeight:700,color:FC.t1,lineHeight:1.25,letterSpacing:seniorMode?0:"-0.4px",marginBottom:12,whiteSpace:"pre-line" as const,textAlign:"center" as const}}>{cfg.header.title}</div>
          <div style={{display:"flex",justifyContent:"center",gap:"8px 16px",fontSize:fs(12.5),color:FC.t2,flexWrap:"wrap" as const,lineHeight:1.55}}>
            {(()=>{
              const schedules=educationScheduleSummaries(cfg.header)
              const hasTuition=cfg.header.tuitionFree||!!cfg.header.tuitionAmount
              return <>
                {schedules.map((item,index)=><span key={`${item.label}_${item.text}_${index}`} style={{display:"inline-flex",alignItems:"center",gap:5}}>
                  {item.label&&<span style={{fontWeight:500,color:FC.t1}}>{item.label}</span>}
                  <span>{item.text}</span>
                </span>)}
                {hasTuition&&schedules.length>0&&<span style={{opacity:.3}}>|</span>}
                {cfg.header.tuitionFree?<span>{cfg.header.tuitionFreeText||"수강료 전액 무료"}</span>:cfg.header.tuitionAmount?<span>{cfg.header.tuitionAmount}원</span>:null}
                {cfg.header.stipend&&<><span style={{opacity:.3}}>|</span><span>지급 수당 {cfg.header.stipend}</span></>}
              </>
            })()}
          </div>
        </div>
        {cfg.ad?.enabled&&<div onClick={()=>setSec("ad")} style={{marginBottom:24,cursor:"pointer",outline:sec==="ad"?`2px solid ${accentBg}`:"none",outlineOffset:4,borderRadius:14}}>
          {renderPreviewAdSlot({...DEFAULT_FORM_AD,...cfg.ad})}
        </div>}
        {pvPage===1&&cfg.header.noticeEnabled&&<div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 14px",borderRadius:(cfg.header.noticeShape||"pill")==="pill"?999:10,background:FC.fieldBg,border:`1px solid ${FC.fieldBorder}`,fontSize:fs(12.5),color:FC.t2,textAlign:"center" as const,lineHeight:1.6}}>
            {cfg.header.noticeIconEnabled&&<span style={{width:seniorMode?20:17,height:seniorMode?20:17,borderRadius:"50%",border:`1px solid ${FC.fieldBorder}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:fs(10),flexShrink:0}}>{cfg.header.noticeIconText}</span>}
            <span style={{lineHeight:1.5}} dangerouslySetInnerHTML={{__html:mdToHtml(cfg.header.noticeText)}}/>
          </div>
        </div>}
        {/* Page nav — current section only */}
        {isMultiPage&&<div style={{marginBottom:qg}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{flex:1,height:3,borderRadius:2,background:FC.fieldBorder,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:2,background:accentBg,width:`${(pvPage/formPages)*100}%`,transition:"width .35s cubic-bezier(.4,0,.2,1)"}}/>
            </div>
            <span style={{fontSize:fs(11.5),fontWeight:600,color:FC.t3,flexShrink:0,fontFamily:FONT}}>{pvPage}/{formPages}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:4,height:18,borderRadius:2,background:accentBg,flexShrink:0}}/>
            <span style={{fontSize:fs(15),fontWeight:700,color:FC.t1,fontFamily:FONT,letterSpacing:seniorMode?0:"-0.2px"}}>{getPageLabel(pvPage)}</span>
          </div>
        </div>}
        {/* Dynamic fields */}
          {previewConsentPosition==="start"&&previewPageShowsConsents&&renderPreviewConsents()}
          {fields.map((field:any,i:number)=>{
          // KDT section_desc
          if(field.type==="section_desc") return <div key={field.id} style={{padding:"14px 16px",borderRadius:fr2,background:FC.fieldBg,border:`1px solid ${FC.fieldBorder}`}}>
            <div style={{fontSize:fs(15),fontWeight:700,color:FC.t1,marginBottom:field.desc?6:0,lineHeight:1.45}}>{field.label}</div>
            {field.desc&&<div style={{fontSize:fs(12.5),color:FC.t3,lineHeight:1.7,whiteSpace:"pre-line" as const}}>{field.desc}</div>}
          </div>
          const id=field.id
          const num=i+1
          const val=pvFieldVals[id]||""
          const setVal=(v:string)=>setPvFieldVals(prev=>({...prev,[id]:v}))
          const dropOpen=pvDropOpen[id]||false
          const setDrop=(v:boolean)=>setPvDropOpen(prev=>({...prev,[id]:v}))
          const selOpt=(field.opts||[]).find((o:any)=>o.value===val)
          const accentC=accentBg
          const inp:React.CSSProperties={width:"100%",height:fh,background:FC.fieldBg,border:`1px solid ${FC.fieldBorder}`,borderRadius:fr2,color:FC.t1,fontFamily:FONT,fontSize:fs(13),padding:"0 13px",outline:"none",boxSizing:"border-box" as const,transition:"border .15s"}
          const helperGap=seniorMode?10:4
          const helperCalloutGap=seniorMode?12:6
          const optionGridGap=seniorMode?12:8
          const checkboxGridGap=seniorMode?14:8
          const isSelected=selectedFieldId===id
          const isDragOver=dragOver===i
          const FTYPES_INLINE=[
            {type:"text" as FieldType,label:"텍스트"},
            {type:"phone" as FieldType,label:"전화번호"},
            {type:"email" as FieldType,label:"이메일"},
            {type:"date" as FieldType,label:"날짜"},
            {type:"dropdown" as FieldType,label:"드롭다운"},
            {type:"button_select" as FieldType,label:"버튼 선택"},
            {type:"checkbox" as FieldType,label:"체크박스"},
            {type:"textarea" as FieldType,label:"장문 입력"},
          ]
          return <div key={field.id}
            draggable
            onDragStart={()=>setDragIdx(i)}
            onDragOver={e=>{
              e.preventDefault();setDragOver(i)
              const rect=(e.currentTarget as HTMLElement).getBoundingClientRect()
              const mid=rect.top+rect.height/2
              setDragInsertAt(e.clientY<mid?i:i+1)
            }}
            onDragEnd={()=>{
              if(dragIdx!==null&&dragInsertAt!==null){
                let target=dragInsertAt
                if(target>dragIdx)target=target-1
                if(target!==dragIdx)moveActiveField(dragIdx,target)
              }
              setDragIdx(null);setDragOver(null);setDragInsertAt(null)
            }}
            onClick={()=>{
              if(selectedFieldId===id){setSelectedFieldId(null);setReplaceId(null)}
              else{
                setSelectedFieldId(id)
                setReplaceId(null)
                // navigate to form panel + expand the field
                setSec("form")
                const fi=fields.findIndex((f:any)=>f.id===id)
                if(fi>=0)setEditIdx(fi)
              }
            }}
            onDragLeave={()=>{setDragOver(null);setDragInsertAt(null)}}
            style={{position:"relative" as const,marginBottom:qg,opacity:dragIdx===i?0.4:1,outline:isSelected?"2px solid "+accentC:"none",outlineOffset:4,borderRadius:fr2,cursor:"pointer"}}>
            {/* Drop line — above */}
            {dragInsertAt===i&&dragIdx!==i&&<div style={{position:"absolute" as const,top:-qg/2-1,left:0,right:0,height:2,borderRadius:1,background:accentC,zIndex:10,pointerEvents:"none" as const}}/>}
            {/* Drop line — below (last item) */}
            {dragInsertAt===i+1&&dragIdx!==i&&i===(fields.length-1)&&<div style={{position:"absolute" as const,bottom:-qg/2-1,left:0,right:0,height:2,borderRadius:1,background:accentC,zIndex:10,pointerEvents:"none" as const}}/>}
            {/* Label row */}
            {!isDisplayOnlyFieldType(field.type)&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:cfg.styles.labelGap??8}}>
              {isSelected&&<span style={{cursor:"grab",color:FC.t3,fontSize:14,lineHeight:1,flexShrink:0,userSelect:"none" as const}}>⠿</span>}
              <div style={{fontSize:fs(12.5),fontWeight:600,color:FC.t1,flex:1,whiteSpace:"pre-line" as const,lineHeight:1.45}}>
                {field.label}{field.required&&<span style={{color:accentBg,marginLeft:3}}>*</span>}
              </div>
              {isSelected&&<div style={{position:"relative" as const}}>
                <button onClick={e=>{e.stopPropagation();setReplaceId(replaceId===id?null:id)}}
                  style={{width:24,height:24,borderRadius:6,border:`1px solid ${FC.fieldBorder}`,background:replaceId===id?accentC:FC.fieldBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:replaceId===id?"#fff":FC.t3}}
                  title="유형 교체">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M1 4h10m-3-3 3 3-3 3M15 12H5m3 3-3-3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {replaceId===id&&<div style={{position:"absolute" as const,top:0,right:28,background:A.card||FC.bg||"#fff",border:`1px solid ${A.border||FC.fieldBorder}`,borderRadius:"8px",padding:6,zIndex:200,display:"flex",flexDirection:"column" as const,gap:2,minWidth:130,boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
                  {FTYPES_DATA.filter(ft=>!ft.divider).map(ft=>{const cur=(field as any).type===ft.type;return(
                    <button key={ft.type} onClick={e=>{e.stopPropagation();patchActiveField(i,{type:ft.type as FieldType});setReplaceId(null)}}
                      style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:6,border:"none",background:cur?A.blue2||accentC+"18":"transparent",color:cur?A.blue||accentC:A.t1||FC.t1,fontFamily:FONT,fontSize:12.5,cursor:"pointer",textAlign:"left" as const,fontWeight:cur?600:400,transition:"background .1s"}}
                      onMouseEnter={e=>{if(!cur)(e.currentTarget as HTMLElement).style.background=A.card2||FC.fieldBg}}
                      onMouseLeave={e=>{if(!cur)(e.currentTarget as HTMLElement).style.background="transparent"}}>
                      <span style={{color:A.t3||FC.t3,display:"flex",alignItems:"center",flexShrink:0}}>{FTYPE_ICONS[ft.type]}</span>
                      <span style={{whiteSpace:"nowrap" as const}}>{ft.label}</span>
                    </button>
                  )})}
                </div>}
              </div>}
            </div>}
            {(()=>{
              const rawH:any[]=(field as any).helpers&&(field as any).helpers.length?(field as any).helpers:(field as any).helper?[{text:(field as any).helper,callout:false}]:[]
              const hs:HelperItem[]=rawH.map((h:any)=>typeof h==="string"?{text:h,callout:false}:h)
              if(isDisplayOnlyFieldType(field.type))return null
              return hs.filter(h=>h.text.trim()).map((h,hi)=>
                h.callout
                  ?<div key={hi} style={{display:"flex",gap:8,padding:"10px 12px",borderRadius:fr2,background:accentC+"0d",border:`1px solid ${accentC}33`,marginBottom:hi===hs.filter(item=>item.text.trim()).length-1?helperCalloutGap:6}}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:1}}><circle cx="8" cy="8" r="6" stroke={accentC} strokeWidth="1.4"/><path d="M8 7v4M8 5.5v.5" stroke={accentC} strokeWidth="1.4" strokeLinecap="round"/></svg>
                    <div style={{fontSize:fs(12.5),color:accentText,lineHeight:1.6,fontWeight:500}} dangerouslySetInnerHTML={{__html:mdToHtml(h.text)}}/>
                  </div>
                  :<div key={hi} style={{fontSize:fs(12.5),color:FC.t3,marginBottom:hi===hs.filter(item=>item.text.trim()).length-1?helperGap:4,lineHeight:1.6}} dangerouslySetInnerHTML={{__html:mdToHtml(h.text)}}/>
              )
            })()}
            {(field.type==="text"||field.type==="name")&&
              <input value={val} onChange={e=>setVal(e.target.value)} placeholder={field.placeholder||""} style={inp}
                onFocus={e=>e.target.style.borderColor=accentC} onBlur={e=>e.target.style.borderColor=FC.fieldBorder}/>}
            {field.type==="ad"&&renderPreviewAdSlot(field)}
            {field.type==="email"&&<div>
              <input value={val} onChange={e=>{setVal(e.target.value);clearError(id)}} placeholder={field.placeholder||""} style={{...inp,borderColor:pvFieldErrors[id]?FC.red||"#FF4B4B":FC.fieldBorder}}
                onFocus={e=>e.target.style.borderColor=pvFieldErrors[id]?FC.red||"#FF4B4B":accentC}
                onBlur={e=>{e.target.style.borderColor=pvFieldErrors[id]?FC.red||"#FF4B4B":FC.fieldBorder;if(val&&!validateEmail(val))setError(id,"올바른 이메일 형식을 입력해주세요. (예: example@email.com)");else clearError(id)}}/>
              {pvFieldErrors[id]&&<div style={{fontSize:fs(11.5),color:FC.red||"#FF4B4B",marginTop:4,fontFamily:FONT}}>{pvFieldErrors[id]}</div>}
            </div>}
            {field.type==="phone"&&<div>
              <input value={val} onChange={e=>{const raw=e.target.value.replace(/\D/g,"").slice(0,11);const fmt=raw.length<=3?raw:raw.length<=7?`${raw.slice(0,3)}-${raw.slice(3)}`:`${raw.slice(0,3)}-${raw.slice(3,7)}-${raw.slice(7)}`;setVal(fmt);clearError(id)}} placeholder={field.placeholder||"예) 010-1234-5678"} inputMode="numeric" style={{...inp,borderColor:pvFieldErrors[id]?FC.red||"#FF4B4B":FC.fieldBorder}}
                onFocus={e=>e.target.style.borderColor=pvFieldErrors[id]?FC.red||"#FF4B4B":accentC}
                onBlur={e=>{e.target.style.borderColor=pvFieldErrors[id]?FC.red||"#FF4B4B":FC.fieldBorder;if(val&&!validatePhone(val))setError(id,"올바른 휴대폰 번호를 입력해주세요. (예: 010-1234-5678)");else clearError(id)}}/>
              {pvFieldErrors[id]&&<div style={{fontSize:fs(11.5),color:FC.red||"#FF4B4B",marginTop:4,fontFamily:FONT}}>{pvFieldErrors[id]}</div>}
            </div>}
            {field.type==="date"&&(()=>{
              const dpOpen=pvDropOpen[id+"_dp"]||false
              const setDpOpen=(v:boolean)=>setPvDropOpen(p=>({...p,[id+"_dp"]:v}))
              const parsed=val?new Date(val):null
              const today=new Date()
              const dpY=pvDpY[id]??(parsed?parsed.getFullYear():today.getFullYear())
              const dpM=pvDpM[id]??(parsed?parsed.getMonth():today.getMonth())
              const setDpY=(y:number)=>setPvDpY(p=>({...p,[id]:y}))
              const setDpM=(m:number)=>setPvDpM(p=>({...p,[id]:m}))
              const setDpD=(d:number)=>setPvDpD(p=>({...p,[id]:d}))
              const displayVal=parsed?`${parsed.getFullYear()}년 ${parsed.getMonth()+1}월 ${parsed.getDate()}일`:""
              const MONTHS=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"]
              const birthRange=birthDateRangeOf(field)
              const configuredYears=[birthRange?.start,birthRange?.end].map(date=>date?Number(String(date).slice(0,4)):NaN).filter(Number.isFinite) as number[]
              const minYear=birthRange?Math.min(today.getFullYear()-120,...configuredYears):today.getFullYear()-80
              const maxYear=birthRange?Math.max(today.getFullYear(),...configuredYears):today.getFullYear()+40
              const daysInMonth=new Date(dpY,dpM+1,0).getDate()
              const selectedDay=Math.min(Math.max(1,pvDpD[id]??(parsed?parsed.getDate():today.getDate())),daysInMonth)
              const setDraftDate=(year:number,month:number,day:number)=>{
                const safeYear=Math.min(maxYear,Math.max(minYear,year))
                const safeMonth=Math.min(11,Math.max(0,month))
                const safeDay=Math.min(new Date(safeYear,safeMonth+1,0).getDate(),Math.max(1,day))
                setDpY(safeYear)
                setDpM(safeMonth)
                setDpD(safeDay)
              }
              const applyDate=(year:number,month:number,day:number)=>{
                const safeYear=Math.min(maxYear,Math.max(minYear,year))
                const safeMonth=Math.min(11,Math.max(0,month))
                const safeDay=Math.min(new Date(safeYear,safeMonth+1,0).getDate(),Math.max(1,day))
                const nextValue=`${safeYear}-${String(safeMonth+1).padStart(2,"0")}-${String(safeDay).padStart(2,"0")}`
                setVal(nextValue)
                const err=dateBirthYearLimitError(field,nextValue)
                if(err)setError(id,err)
                else clearError(id)
                setDpOpen(false)
              }
              const openPicker=()=>{
                if(!dpOpen){
                  const base=parsed&&!Number.isNaN(parsed.getTime())?parsed:today
                  setDraftDate(base.getFullYear(),base.getMonth(),base.getDate())
                }
                setDpOpen(!dpOpen)
              }
              const WHEEL_ITEM_HEIGHT=42
              const WHEEL_VISIBLE_ITEMS=5
              const WHEEL_SPACER_HEIGHT=WHEEL_ITEM_HEIGHT*2
              const years=Array.from({length:maxYear-minYear+1},(_,idx)=>minYear+idx)
              const months=Array.from({length:12},(_,idx)=>idx)
              const days=Array.from({length:daysInMonth},(_,idx)=>idx+1)
              const wheelColumn=(label:string,values:number[],activeValue:number,format:(value:number)=>string,onSelect:(value:number)=>void)=>{
                const activeIndex=Math.max(0,values.indexOf(activeValue))
                const syncKey=`${values.length}-${activeIndex}`
                const handleScrollEnd=(el:HTMLDivElement)=>{
                  const idx=Math.min(values.length-1,Math.max(0,Math.round(el.scrollTop/WHEEL_ITEM_HEIGHT)))
                  const nextValue=values[idx]
                  el.dataset.userScrolling="0"
                  el.dataset.syncKey=`${values.length}-${idx}`
                  el.scrollTo({top:idx*WHEEL_ITEM_HEIGHT,behavior:"smooth"})
                  if(typeof nextValue==="number"&&nextValue!==activeValue)onSelect(nextValue)
                }
                return <div>
                  <div style={{fontSize:11,fontWeight:600,color:FC.t3,textAlign:"center" as const,marginBottom:6,fontFamily:FONT}}>{label}</div>
                  <div style={{position:"relative" as const,height:WHEEL_ITEM_HEIGHT*WHEEL_VISIBLE_ITEMS,borderRadius:18,border:`1px solid ${FC.fieldBorder}`,background:FC.fieldBg,boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.02)",overflow:"hidden"}}>
                    <div style={{position:"absolute" as const,left:7,right:7,top:WHEEL_SPACER_HEIGHT,height:WHEEL_ITEM_HEIGHT,borderTop:`1px solid ${FC.fieldBorder}`,borderBottom:`1px solid ${FC.fieldBorder}`,borderRadius:10,background:accentC+"12",pointerEvents:"none" as const,zIndex:1}}/>
                    <div className="cf-date-wheel-list" ref={node=>{if(node&&node.dataset.syncKey!==syncKey&&node.dataset.userScrolling!=="1"){node.dataset.syncKey=syncKey;node.scrollTop=activeIndex*WHEEL_ITEM_HEIGHT}}}
                      onWheelCapture={e=>e.stopPropagation()}
                      onWheel={e=>{e.preventDefault();e.stopPropagation();e.currentTarget.scrollTop+=e.deltaY}}
                      onScroll={e=>{const el=e.currentTarget;el.dataset.userScrolling="1";window.clearTimeout(Number(el.dataset.scrollTimer||0));el.dataset.scrollTimer=String(window.setTimeout(()=>handleScrollEnd(el),90))}}
                      style={{position:"relative" as const,zIndex:2,height:"100%",padding:"0 7px",boxSizing:"border-box" as const,overflowY:"auto" as const,overscrollBehavior:"contain",touchAction:"pan-y" as const,scrollSnapType:"y mandatory" as const,WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
                      <div style={{height:WHEEL_SPACER_HEIGHT,flexShrink:0}}/>
                      {values.map((value,idx)=>{
                        const isActive=value===activeValue
                        const distance=Math.abs(idx-activeIndex)
                        return <button key={value} onClick={()=>onSelect(value)}
                          style={{width:"100%",height:WHEEL_ITEM_HEIGHT,scrollSnapAlign:"center" as const,border:"none",background:"transparent",color:isActive?FC.t1:distance===1?FC.t2:FC.t3,fontFamily:FONT,fontSize:isActive?18:distance===1?15:12.5,fontWeight:isActive?700:500,cursor:"pointer",transition:"all .12s ease"}}>
                          {format(value)}
                        </button>
                      })}
                      <div style={{height:WHEEL_SPACER_HEIGHT,flexShrink:0}}/>
                    </div>
                  </div>
                </div>
              }
              return <div style={{position:"relative" as const,display:"inline-block"}}>
                <div onClick={openPicker}
                  style={{height:fh,display:"inline-flex",alignItems:"center",gap:10,padding:"0 14px",borderRadius:fr2,border:`1px solid ${dpOpen?accentC:pvFieldErrors[id]?FC.red||"#FF4B4B":FC.fieldBorder}`,background:FC.fieldBg,cursor:"pointer",userSelect:"none" as const,transition:"border .15s"}}>
                  <span style={{fontSize:fs(13),color:displayVal?FC.t1:FC.t3,fontFamily:FONT}}>{displayVal||"날짜를 선택해주세요"}</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,color:FC.t3}}><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </div>
                {dpOpen&&<div style={{position:"absolute" as const,top:"calc(100% + 6px)",left:0,zIndex:200,background:FC.bg,border:`1px solid ${FC.fieldBorder}`,borderRadius:20,padding:"14px",boxShadow:"0 12px 36px rgba(0,0,0,0.18)",width:342}}>
                  <style>{`.cf-date-wheel-list{scrollbar-width:none;-ms-overflow-style:none}.cf-date-wheel-list::-webkit-scrollbar{display:none;width:0;height:0}`}</style>
                  <div style={{display:"grid",gridTemplateColumns:"1.15fr 0.82fr 0.82fr",gap:10}}>
                    {wheelColumn("년",years,dpY,value=>`${value}년`,value=>setDraftDate(value,dpM,selectedDay))}
                    {wheelColumn("월",months,dpM,value=>MONTHS[value],value=>setDraftDate(dpY,value,selectedDay))}
                    {wheelColumn("일",days,selectedDay,value=>`${value}일`,value=>setDraftDate(dpY,dpM,value))}
                  </div>
                  <div style={{marginTop:12,borderTop:`1px solid ${FC.fieldBorder}`,paddingTop:11,display:"flex",justifyContent:"center",gap:8}}>
                    <button onClick={()=>setDraftDate(today.getFullYear(),today.getMonth(),today.getDate())}
                      style={{padding:"5px 14px",borderRadius:8,border:`1px solid ${FC.fieldBorder}`,background:"transparent",color:FC.t3,fontFamily:FONT,fontSize:12.5,cursor:"pointer"}}>
                      오늘
                    </button>
                    <button onClick={()=>applyDate(dpY,dpM,selectedDay)}
                      style={{padding:"5px 20px",borderRadius:8,border:`1px solid ${accentC}`,background:accentC,color:cfg.cta.color||"#fff",fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>
                      확인
                    </button>
                  </div>
                </div>}
                {pvFieldErrors[id]&&<div style={{fontSize:fs(11.5),color:FC.red||"#FF4B4B",marginTop:4,fontFamily:FONT}}>{pvFieldErrors[id]}</div>}
              </div>
            })()}
            {field.type==="time"&&(()=>{
              const ampm=pvFieldVals[id+"_ampm"]||"오전"
              const hh=pvFieldVals[id+"_h"]||""
              const mm=pvFieldVals[id+"_m"]||""
              const setAmpm=(v:string)=>setPvFieldVals(p=>({...p,[id+"_ampm"]:v}))
              const setHh=(v:string)=>setPvFieldVals(p=>({...p,[id+"_h"]:v}))
              const setMm=(v:string)=>setPvFieldVals(p=>({...p,[id+"_m"]:v}))
              const hours=Array.from({length:12},(_,i)=>String(i+1).padStart(2,"0"))
              const mins=Array.from({length:60},(_,i)=>String(i).padStart(2,"0"))
              const boxS:React.CSSProperties={position:"relative" as const,width:80,flexShrink:0}
              const inpS:React.CSSProperties={width:"100%",height:fh,background:FC.fieldBg,border:`1px solid ${FC.fieldBorder}`,borderRadius:fr2,color:FC.t1,fontFamily:FONT,fontSize:fs(14),padding:`0 28px 0 12px`,outline:"none",cursor:"text",boxSizing:"border-box" as const,transition:"border .15s"}
              return <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {/* 오전/오후 */}
                <div style={{display:"flex",borderRadius:fr2,border:`1px solid ${FC.fieldBorder}`,overflow:"hidden",flexShrink:0}}>
                  {["오전","오후"].map(v=><button key={v} onClick={()=>setAmpm(v)}
                    style={{height:fh,padding:"0 12px",border:"none",background:ampm===v?accentC:FC.fieldBg,color:ampm===v?"#fff":FC.t2,fontFamily:FONT,fontSize:fs(13),fontWeight:ampm===v?600:400,cursor:"pointer",transition:"all .15s"}}>
                    {v}
                  </button>)}
                </div>
                {/* 시 */}
                <div style={boxS}>
                  <input value={hh} onChange={e=>{const v=e.target.value.replace(/\D/g,"");if(v===""||Number(v)<=12)setHh(v)}}
                    placeholder="시" maxLength={2} style={inpS} inputMode="numeric"
                    onFocus={e=>e.target.style.borderColor=accentC} onBlur={e=>{e.target.style.borderColor=FC.fieldBorder;if(hh&&Number(hh)>=1)setHh(String(Number(hh)).padStart(2,"0"))}}/>
                  {/* 화살표 아이콘 */}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{position:"absolute" as const,right:9,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" as const,color:FC.t3}}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <select value={hh} onChange={e=>setHh(e.target.value)}
                    style={{position:"absolute" as const,inset:0,width:"100%",height:"100%",opacity:0,cursor:"pointer"}}>
                    <option value="">시</option>
                    {hours.map(h=><option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <span style={{color:FC.t3,fontWeight:600,fontSize:fs(16),flexShrink:0}}>:</span>
                {/* 분 */}
                <div style={boxS}>
                  <input value={mm} onChange={e=>{const v=e.target.value.replace(/\D/g,"");if(v===""||Number(v)<=59)setMm(v)}}
                    onBlur={e=>{e.target.style.borderColor=FC.fieldBorder;if(mm!=="")setMm(String(Number(mm)).padStart(2,"0"))}}
                    placeholder="분" maxLength={2} style={inpS} inputMode="numeric"
                    onFocus={e=>e.target.style.borderColor=accentC}/>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{position:"absolute" as const,right:9,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" as const,color:FC.t3}}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <select value={mm} onChange={e=>setMm(e.target.value)}
                    style={{position:"absolute" as const,inset:0,width:"100%",height:"100%",opacity:0,cursor:"pointer"}}>
                    <option value="">분</option>
                    {mins.map(m=><option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            })()}
            {field.type==="textarea"&&
              <textarea value={val} onChange={e=>setVal(e.target.value)} placeholder={field.placeholder||""}
                style={{width:"100%",minHeight:seniorMode?112:80,background:FC.fieldBg,border:`1px solid ${FC.fieldBorder}`,borderRadius:fr2,color:FC.t1,fontFamily:FONT,fontSize:fs(13),padding:"10px 13px",outline:"none",resize:"vertical" as const,boxSizing:"border-box" as const,lineHeight:1.6}}
                onFocus={e=>e.target.style.borderColor=accentC} onBlur={e=>e.target.style.borderColor=FC.fieldBorder}/>}
            {field.type==="info"&&<div style={{borderRadius:fr2,background:FC.fieldBg,fontSize:fs(13),lineHeight:1.7,overflow:"hidden"}}>
              {(field as any).imageUrl&&<div style={{...imagePreviewBoxStyle(field,220),borderRadius:0,background:FC.fieldBg}}>
                <img src={(field as any).imageUrl} alt={(field as any).imageCaption||""} style={imagePreviewImgStyle(field)}/>
              </div>}
              {(field.placeholder||!(field as any).imageUrl)&&<div style={{padding:"12px 14px"}}>
                <div style={{fontSize:fs(13),color:FC.t1,opacity:seniorMode?1:0.7,lineHeight:1.7,fontFamily:"'Pretendard Variable','Pretendard',sans-serif"}}
                  dangerouslySetInnerHTML={{__html:mdToHtml(field.placeholder||"안내 텍스트를 입력해주세요.")}}/>
                {(field as any).imageCaption&&(field as any).imageUrl&&<div style={{fontSize:fs(11),color:FC.t3,marginTop:4}}>{(field as any).imageCaption}</div>}
              </div>}
            </div>}
            {field.type==="file"&&(()=>{
              const fid=id+"_file"
              const fname=pvFieldVals[fid]||""
              return <div>
                <label htmlFor={fid} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,height:fh,borderRadius:fr2,border:`1.5px dashed ${fname?accentC:FC.fieldBorder}`,background:fname?accentC+"0a":FC.fieldBg,cursor:"pointer",fontFamily:FONT,fontSize:fs(13),color:fname?accentC:FC.t3,fontWeight:500,transition:"all .15s"}}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 11V5M5.5 7.5L8 5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 11.5A2.5 2.5 0 0 0 5.5 14h5A2.5 2.5 0 0 0 13 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  {fname?fname:(field.placeholder||"파일 업로드")}
                </label>
                <div style={{fontSize:fs(11.5),color:FC.t3,marginTop:6,fontFamily:FONT}}>{FILE_LIMIT_TEXT}</div>
                <input id={fid} type="file" multiple style={{display:"none"}} onChange={e=>{const files=Array.from(e.target.files||[]);if(files.length)setPvFieldVals(p=>({...p,[fid]:files.map(f=>f.name).join(" / ")}));e.target.value=""}}/>
                {fname&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:6,padding:"6px 10px",borderRadius:fr2,background:accentC+"10",border:`1px solid ${accentC}33`}}>
                  <span style={{fontSize:fs(12),color:accentC,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{fname}</span>
                  <button onClick={()=>setPvFieldVals(p=>{const n={...p};delete n[fid];return n})} style={{fontSize:fs(13),color:accentC,border:"none",background:"none",cursor:"pointer",padding:"0 0 0 8px",flexShrink:0,lineHeight:1}}>×</button>
                </div>}
              </div>
            })()}
            {field.type==="dropdown"&&(()=>{
              const ddOpts:any[]=(field.opts&&field.opts.length)?field.opts:(field.options||[]).map((o:any)=>({label:String(o),value:String(o),isEtc:false}))
              const ddSel=ddOpts.find((o:any)=>o.value===val)
              return <div style={{position:"relative" as const}}>
              <div onClick={()=>setDrop(!dropOpen)}
                style={{...inp,height:fh,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",border:`1px solid ${dropOpen?accentC:FC.fieldBorder}`}}>
                <span style={{color:ddSel?FC.t1:FC.t3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const,flex:1,fontSize:fs(13)}}>{ddSel?.label||field.placeholder||"선택해주세요."}</span>
                <span style={{fontSize:fs(11),color:FC.t3,flexShrink:0}}>{dropOpen?"▴":"▾"}</span>
              </div>
              {dropOpen&&<div style={{position:"absolute" as const,top:"100%",left:0,right:0,marginTop:4,background:FC.bg,border:`1px solid ${FC.fieldBorder}`,borderRadius:fr2,maxHeight:180,overflowY:"auto" as const,zIndex:50,boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
                {ddOpts.map((opt:any)=>{const s=opt.value===val;return(
                  <div key={opt.value} onClick={()=>{setVal(opt.value);setDrop(false)}}
                    style={{padding:"9px 13px",cursor:"pointer",fontSize:fs(13),fontFamily:FONT,display:"flex",alignItems:"center",justifyContent:"space-between",background:s?accentC+"14":"transparent",color:s?accentC:FC.t1}}
                    onMouseEnter={e=>{if(!s)(e.currentTarget as HTMLElement).style.background=FC.fieldBg}}
                    onMouseLeave={e=>{if(!s)(e.currentTarget as HTMLElement).style.background="transparent"}}>
                    {opt.label}{s&&<span style={{fontWeight:600}}>✓</span>}
                  </div>
                )})}
              </div>}
              {ddSel?.isEtc&&<div style={{marginTop:8}}>
                <input value={pvFieldVals[id+"_etc"]||""} onChange={e=>setPvFieldVals(p=>({...p,[id+"_etc"]:e.target.value}))} placeholder={field.etcPh||"직접 입력해주세요."} style={inp}/>
              </div>}
            </div>})()
            }
            {field.type==="button_select"&&(()=>{
              // Support both opts (Opt[]) for regular forms and options (string[]) for KDT
              const opts:any[]=(field.opts&&field.opts.length)?field.opts:(field.options||[]).map((o:any)=>({label:String(o),value:String(o)}))
              const cols=(field as any).cols||1
              const selOpt=opts.find((o:any)=>o.value===val)
              return <div>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:optionGridGap}}>
                {opts.map((opt:any)=>{const s=opt.value===val;return(
                  <button key={opt.value} onClick={()=>setVal(s?"":opt.value)}
                    style={{padding:seniorMode?"12px 10px":"10px 8px",borderRadius:fr2,border:`1px solid ${s?accentC:FC.fieldBorder}`,background:s?accentC+"14":"transparent",color:s?accentC:FC.t2,fontFamily:FONT,fontSize:fs(13),cursor:"pointer",fontWeight:s?600:400,transition:"all .12s",textAlign:"center" as const,whiteSpace:"pre-wrap" as const,wordBreak:"keep-all" as const}}>
                    {opt.label}
                  </button>
                )})}
              </div>
              {selOpt?.isEtc&&<div style={{marginTop:8}}>
                <input value={pvFieldVals[id+"_etc"]||""} onChange={e=>setPvFieldVals(p=>({...p,[id+"_etc"]:e.target.value}))}
                  placeholder={field.etcPh||"직접 입력해주세요."} style={inp}
                  onFocus={e=>e.target.style.borderColor=accentC} onBlur={e=>e.target.style.borderColor=FC.fieldBorder}/>
              </div>}
              </div>
            })()}
            {field.type==="checkbox"&&(()=>{
              const cbCols=(field as any).cols||1
              const cbOpts:any[]=((field.opts&&field.opts.length)?field.opts:(field.options||[])).map((o:any)=>{
                const label=String(o?.label??o?.value??o)
                const value=String(o?.value??o?.label??o)
                const key=value.trim().toLowerCase()
                return {...(typeof o==="object"?o:{}),label,value,isEtc:!!o?.isEtc||label.trim()==="기타"||value.trim()==="기타"||key==="etc"||key==="other"}
              })
              const checkedVals=pvFieldChecked[id]||[]
              const etcOpt=cbOpts.find((opt:any)=>opt.isEtc&&checkedVals.includes(opt.value))
              return <div>
                <div style={{display:"grid",gridTemplateColumns:`repeat(${cbCols},1fr)`,gap:checkboxGridGap}}>
                  {cbOpts.map(opt=>{
                    const checked=checkedVals.includes(opt.value)
                    const toggle=()=>setPvFieldChecked(p=>{const cur=p[id]||[];return{...p,[id]:checked?cur.filter(v=>v!==opt.value):[...cur,opt.value]}})
                    return <div key={opt.value} onClick={toggle} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                      <div style={{width:18,height:18,borderRadius:4,border:`1px solid ${checked?accentC:FC.fieldBorder}`,background:checked?accentC:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                        {checked&&<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{fontSize:fs(13),color:FC.t1,fontFamily:FONT}}>{opt.label}</span>
                    </div>
                  })}
                </div>
                {etcOpt&&<div style={{marginTop:8}}>
                  <input value={pvFieldVals[id+"_etc"]||""} onChange={e=>setPvFieldVals(p=>({...p,[id+"_etc"]:e.target.value}))}
                    placeholder={field.etcPh||"직접 입력해주세요."} style={inp}
                    onFocus={e=>e.target.style.borderColor=accentC} onBlur={e=>e.target.style.borderColor=FC.fieldBorder}/>
                </div>}
              </div>
            })()}
          </div>
        })}
        {previewConsentPosition==="end"&&previewPageShowsConsents&&renderPreviewConsents()}
        {/* CTA — first: next only, middle: prev+next, last: submit */}
        <div style={{display:"flex",gap:10}}>
          {isMultiPage&&pvPage>1&&<button onClick={goPreviewPrevious}
            style={{flex:1,height:seniorFieldHeight(seniorMode,cfg.cta.height),borderRadius:fr2,border:"none",background:FC.fieldBg||"#F2F4F6",color:FC.t2,fontFamily:FONT,fontSize:fs(14.5),fontWeight:700,cursor:"pointer"}}>이전</button>}
          {isMultiPage&&pvPage<formPages
            ?<button onClick={goPreviewNext}
                style={{flex:2,height:seniorFieldHeight(seniorMode,cfg.cta.height),borderRadius:fr2,border:"none",background:accentBg,color:cfg.cta.color,fontFamily:FONT,fontSize:fs(14.5),fontWeight:700,cursor:"pointer"}}>다음</button>
            :<button style={{flex:2,height:seniorFieldHeight(seniorMode,cfg.cta.height),borderRadius:fr2,border:"none",background:accentBg,color:cfg.cta.color,fontFamily:FONT,fontSize:fs(14.5),fontWeight:700,cursor:"pointer"}}>{cfg.cta.label}</button>}
        </div>
      </div>
    </div>
  }
  function renderKdtPreview() {
    const fields = cfg.kdtFields||[]
    const pages = Array.from({length:formPages},(_,i)=>i+1)
    const curFields = fields.filter(f=>f.page===pvPage)
    const fh = seniorFieldHeight(seniorMode,cfg.styles.fieldH||48)
    const fr2 = seniorMode?"10px":cfg.styles.theme==="dark"?"6px":"8px"
    const qg = seniorGap(seniorMode,cfg.styles.qGap||20)
    const lg = seniorGap(seniorMode,cfg.styles.labelGap??8)
    return <div style={{flex:1,display:"flex",justifyContent:"center",padding:0,background:"transparent"}}>
      <div style={{width:"100%",maxWidth:cfg.styles.maxW,fontFamily:FONT,padding:seniorMode?"44px 34px 48px":"36px 34px 32px",borderRadius:14,background:FC.bg,boxShadow:cfg.styles.theme==="dark"?"0 1px 2px rgba(0,0,0,.18), 0 12px 32px -20px rgba(0,0,0,.6)":ALT.shadow,height:"fit-content",boxSizing:"border-box" as const}}>
        {/* 헤더 */}
        {cfg.header.title&&<div style={{marginBottom:24}}>
          {cfg.header.overline&&<div style={{fontSize:fs(12.5),fontWeight:700,color:accentText,marginBottom:8,textAlign:"center" as const}}>{cfg.header.overline}</div>}
          <div style={{fontSize:fs(26),fontWeight:700,color:FC.t1,lineHeight:1.25,letterSpacing:seniorMode?0:"-0.4px",whiteSpace:"pre-line" as const,textAlign:"center" as const}}>{cfg.header.title}</div>
        </div>}
        {cfg.ad?.enabled&&<div onClick={()=>setSec("ad")} style={{marginBottom:24,cursor:"pointer",outline:sec==="ad"?`2px solid ${accentBg}`:"none",outlineOffset:4,borderRadius:14}}>
          {renderPreviewAdSlot({...DEFAULT_FORM_AD,...cfg.ad})}
        </div>}
        {/* 스텝 인디케이터 — elastic stepper */}
        <div style={{display:"flex",gap:6,marginBottom:seniorMode?32:28}}>
          {pages.map(p=>{const active=pvPage===p;const done=pvPage>p;return(
            <button key={p} onClick={()=>setPvPage(p)}
              style={{flex:active?3:1,height:seniorFieldHeight(seniorMode,38),borderRadius:fr2,border:"none",cursor:"pointer",fontFamily:FONT,transition:"all .35s cubic-bezier(.4,0,.2,1)",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:active?"flex-start":"center",gap:8,padding:active?"0 14px":"0 8px",background:active?accentBg:done?"transparent":"transparent",borderBottom:`2px solid ${active?accentBg:done?accentBg+"66":FC.fieldBorder}`}}>
              <span style={{width:seniorMode?20:16,height:seniorMode?20:16,borderRadius:"50%",background:active?"rgba(255,255,255,0.25)":done?accentBg+"22":"transparent",border:`1.5px solid ${active?"rgba(255,255,255,0.6)":done?accentBg+"88":FC.fieldBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:fs(9),fontWeight:600,color:active?"#fff":done?accentBg:FC.t3,flexShrink:0,transition:"all .35s"}}>
                {done?<svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>:p}
              </span>
              <span style={{fontSize:active?fs(13):fs(10.5),fontWeight:active?600:500,color:active?"#fff":done?FC.t2:FC.t3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const,transition:"all .35s",maxWidth:active?"none":"60px"}}>
                {getPageLabel(p)}
              </span>
            </button>
          )})}
        </div>
        {/* 필드 렌더 */}
        <div style={{display:"flex",flexDirection:"column" as const,gap:qg}}>
          {curFields.map((field,idx)=>{
            if(field.type==="section_desc") return <div key={field.id} style={{padding:"14px 16px",borderRadius:fr2,background:FC.fieldBg,border:`1px solid ${FC.fieldBorder}`}}>
              <div style={{fontSize:fs(15),fontWeight:700,color:FC.t1,marginBottom:field.desc?6:0,lineHeight:1.45}}>{field.label}</div>
              {field.desc&&<div style={{fontSize:fs(12.5),color:FC.t3,lineHeight:1.7,whiteSpace:"pre-line" as const}}>{field.desc}</div>}
            </div>
            const kdtId=field.id
            const kdtIsSelected=selectedFieldId===kdtId
            return <div key={field.id}
              draggable
              onDragStart={()=>{setDragIdx(idx)}}
              onDragOver={e=>{e.preventDefault();setDragOver(idx);const rect=(e.currentTarget as HTMLElement).getBoundingClientRect();setDragInsertAt(e.clientY<rect.top+rect.height/2?idx:idx+1)}}
              onDragEnd={()=>{if(dragIdx!==null&&dragInsertAt!==null){let t=dragInsertAt;if(t>dragIdx)t=t-1;if(t!==dragIdx)moveActiveField(dragIdx,t)}setDragIdx(null);setDragOver(null);setDragInsertAt(null)}}
              onDragLeave={()=>{setDragOver(null);setDragInsertAt(null)}}
              onClick={()=>{if(selectedFieldId===kdtId){setSelectedFieldId(null);setReplaceId(null)}else{setSelectedFieldId(kdtId);setReplaceId(null);setSec("form");const fi=curFields.findIndex((f:any)=>f.id===kdtId);if(fi>=0)setEditIdx(fi)}}}
              style={{position:"relative" as const,marginBottom:qg,opacity:dragIdx===idx?0.4:1,outline:kdtIsSelected?"2px solid "+accentBg:"none",outlineOffset:4,borderRadius:fr2,cursor:"pointer"}}>
              {dragInsertAt===idx&&dragIdx!==idx&&<div style={{position:"absolute" as const,top:-qg/2-1,left:0,right:0,height:2,borderRadius:1,background:accentBg,zIndex:10,pointerEvents:"none" as const}}/>}
              {!isDisplayOnlyFieldType(field.type)&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:lg}}>
                {kdtIsSelected&&<span style={{cursor:"grab",color:FC.t3,fontSize:14,lineHeight:1,flexShrink:0,userSelect:"none" as const}}>⠿</span>}
                <div style={{fontSize:fs(12.5),fontWeight:600,color:FC.t1,flex:1,whiteSpace:"pre-line" as const,lineHeight:1.45}}>
                  {field.label}{field.required&&<span style={{color:accentBg,marginLeft:3}}>*</span>}
                </div>
                {kdtIsSelected&&<div style={{position:"relative" as const}}>
                  <button onClick={e=>{e.stopPropagation();setReplaceId(replaceId===kdtId?null:kdtId)}}
                    style={{width:24,height:24,borderRadius:6,border:`1px solid ${FC.fieldBorder}`,background:replaceId===kdtId?accentBg:FC.fieldBg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:replaceId===kdtId?"#fff":FC.t3}} title="유형 교체">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M1 4h10m-3-3 3 3-3 3M15 12H5m3 3-3-3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  {replaceId===kdtId&&<div style={{position:"absolute" as const,top:0,right:28,background:A.card||FC.bg||"#fff",border:`1px solid ${A.border||FC.fieldBorder}`,borderRadius:"8px",padding:6,zIndex:200,display:"flex",flexDirection:"column" as const,gap:2,minWidth:130,boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
                    {FTYPES_DATA.filter(ft=>!ft.divider).map(ft=>{const cur=(field as any).type===ft.type;return(
                      <button key={ft.type} onClick={e=>{e.stopPropagation();patchActiveField(idx,{type:ft.type as FieldType});setReplaceId(null)}}
                        style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:6,border:"none",background:cur?A.blue2||accentBg+"18":"transparent",color:cur?A.blue||accentBg:A.t1||FC.t1,fontFamily:FONT,fontSize:12.5,cursor:"pointer",textAlign:"left" as const,fontWeight:cur?600:400}}
                        onMouseEnter={e=>{if(!cur)(e.currentTarget as HTMLElement).style.background=A.card2||FC.fieldBg}}
                        onMouseLeave={e=>{if(!cur)(e.currentTarget as HTMLElement).style.background="transparent"}}>
                        <span style={{color:A.t3||FC.t3,display:"flex",alignItems:"center",flexShrink:0}}>{FTYPE_ICONS[ft.type]}</span>
                        <span style={{whiteSpace:"nowrap" as const}}>{ft.label}</span>
                      </button>
                    )})}
                  </div>}
                </div>}
              </div>}
              {(()=>{if(isDisplayOnlyFieldType(field.type))return null;const rawH:any[]=((field as any).helpers&&(field as any).helpers.length)?(field as any).helpers:((field as any).helper)?[{text:(field as any).helper,callout:false}]:[];const hs=rawH.map((h:any)=>typeof h==="string"?{text:h,callout:false}:h);return hs.filter((h:any)=>h.text&&h.text.trim()).map((h:any,hi:number)=>h.callout?<div key={hi} style={{display:"flex",gap:8,padding:"10px 12px",borderRadius:fr2,background:accentBg+"0d",border:`1px solid ${accentBg}33`,marginBottom:6}}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:1}}><circle cx="8" cy="8" r="6" stroke={accentBg} strokeWidth="1.4"/><path d="M8 7v4M8 5.5v.5" stroke={accentBg} strokeWidth="1.4" strokeLinecap="round"/></svg><div style={{fontSize:fs(12.5),color:accentText,lineHeight:1.6,fontWeight:500}} dangerouslySetInnerHTML={{__html:mdToHtml(h.text)}}/>  </div>:<div key={hi} style={{fontSize:fs(12.5),color:FC.t3,marginBottom:4,lineHeight:1.6}} dangerouslySetInnerHTML={{__html:mdToHtml(h.text)}}/>)})()}
              {(field.type==="text"||field.type==="name")&&<input
                value={pvKdtVals[field.id]||""}
                onChange={e=>setPvKdtVals(v=>({...v,[field.id]:e.target.value}))}
                placeholder={field.placeholder||""}
                style={{width:"100%",height:fh,background:FC.fieldBg,border:`1px solid ${FC.fieldBorder}`,borderRadius:fr2,color:FC.t1,fontFamily:FONT,fontSize:fs(13),padding:"0 13px",outline:"none",boxSizing:"border-box" as const,transition:"border .15s"}}
                onFocus={e=>{e.target.style.borderColor=accentBg}}
                onBlur={e=>{e.target.style.borderColor=FC.fieldBorder}}
              />}
              {field.type==="ad"&&renderPreviewAdSlot(field)}
              {field.type==="date"&&<input type="date"
                value={pvKdtVals[field.id]||""}
                onChange={e=>{
                  const nextValue=e.target.value
                  setPvKdtVals(v=>({...v,[field.id]:nextValue}))
                  const err=dateBirthYearLimitError(field,nextValue)
                  setPvFieldErrors(p=>{const n={...p};if(err)n[field.id]=err;else delete n[field.id];return n})
                }}
                style={{width:"100%",height:fh,background:FC.fieldBg,border:`1px solid ${pvFieldErrors[field.id]?FC.red||"#FF4B4B":FC.fieldBorder}`,borderRadius:fr2,color:pvKdtVals[field.id]?FC.t1:FC.t3,fontFamily:FONT,fontSize:fs(13),padding:"0 13px",outline:"none",boxSizing:"border-box" as const,colorScheme:cfg.styles.theme==="dark"&&!seniorMode?"dark" as any:"light" as any}}
              />}
              {field.type==="date"&&pvFieldErrors[field.id]&&<div style={{fontSize:fs(11.5),color:FC.red||"#FF4B4B",marginTop:4,fontFamily:FONT}}>{pvFieldErrors[field.id]}</div>}
              {field.type==="textarea"&&<textarea
                value={pvKdtVals[field.id]||""}
                onChange={e=>setPvKdtVals(v=>({...v,[field.id]:e.target.value}))}
                placeholder={field.placeholder||""}
                style={{width:"100%",minHeight:seniorMode?112:90,background:FC.fieldBg,border:`1px solid ${FC.fieldBorder}`,borderRadius:fr2,color:FC.t1,fontFamily:FONT,fontSize:fs(13),padding:"10px 13px",outline:"none",resize:"vertical" as const,boxSizing:"border-box" as const,lineHeight:1.65,transition:"border .15s"}}
                onFocus={e=>{e.target.style.borderColor=accentBg}}
                onBlur={e=>{e.target.style.borderColor=FC.fieldBorder}}
              />}
              {field.type==="info"&&<div style={{borderRadius:fr2,background:FC.fieldBg,fontSize:fs(13),lineHeight:1.7,fontFamily:FONT,overflow:"hidden"}}>
                {(field as any).imageUrl&&<div style={{...imagePreviewBoxStyle(field,220),borderRadius:0,background:FC.fieldBg}}>
                  <img src={(field as any).imageUrl} alt={(field as any).imageCaption||""} style={imagePreviewImgStyle(field)}/>
                </div>}
                {((field as any).placeholder||!(field as any).imageUrl)&&<div style={{padding:"12px 14px"}} dangerouslySetInnerHTML={{__html:mdToHtml((field as any).placeholder||"")}}/>}
                {(field as any).imageCaption&&(field as any).imageUrl&&<div style={{fontSize:fs(11),color:FC.t3,padding:"0 14px 10px"}}>{(field as any).imageCaption}</div>}
              </div>}
              {field.type==="dropdown"&&<div style={{position:"relative" as const}}>
                <div onClick={()=>setPvKdtDrops(v=>({...v,[field.id]:!v[field.id]}))}
                  style={{height:fh,background:FC.fieldBg,border:`1px solid ${pvKdtDrops[field.id]?accentBg:FC.fieldBorder}`,borderRadius:fr2,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 13px",cursor:"pointer",transition:"border .15s"}}>
                  <span style={{fontSize:fs(13),color:pvKdtVals[field.id]?FC.t1:FC.t3,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{pvKdtVals[field.id]||field.placeholder||"선택해주세요."}</span>
                  <span style={{fontSize:fs(11),color:FC.t3,flexShrink:0,marginLeft:6}}>{pvKdtDrops[field.id]?"▴":"▾"}</span>
                </div>
                {pvKdtDrops[field.id]&&<div style={{position:"absolute" as const,top:"100%",left:0,right:0,marginTop:4,background:FC.bg,border:`1px solid ${FC.fieldBorder}`,borderRadius:fr2,maxHeight:180,overflowY:"auto" as const,zIndex:50,boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
                  {(field.options||[]).map(opt=>{const sel=pvKdtVals[field.id]===opt;return(
                    <div key={opt} onClick={()=>{setPvKdtVals(v=>({...v,[field.id]:opt}));setPvKdtDrops(v=>({...v,[field.id]:false}))}}
                      style={{padding:"9px 13px",cursor:"pointer",fontSize:fs(13),fontFamily:FONT,display:"flex",alignItems:"center",justifyContent:"space-between",background:sel?accentBg+"14":"transparent",color:sel?accentText:FC.t1,transition:"background .08s"}}
                      onMouseEnter={e=>{if(!sel)(e.currentTarget as HTMLElement).style.background=FC.fieldBg}}
                      onMouseLeave={e=>{if(!sel)(e.currentTarget as HTMLElement).style.background="transparent"}}>
                      <span>{opt}</span>{sel&&<span style={{fontWeight:600}}>✓</span>}
                    </div>
                  )})}
                </div>}
              </div>}
              {field.type==="button_select"&&(()=>{
                const opts:any[]=((field as any).opts&&(field as any).opts.length)?(field as any).opts:(field.options||[]).map((o:any)=>({label:String(o),value:String(o)}))
                const cols=(field as any).cols||1
                const selOpt=opts.find((o:any)=>o.value===pvKdtVals[field.id])
                return <div>
                <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:seniorMode?12:8}}>
                  {opts.map((opt:any)=>{const sel=pvKdtVals[field.id]===opt.value;return(
                    <button key={opt.value} onClick={()=>setPvKdtVals(v=>({...v,[field.id]:sel?"":opt.value}))}
                      style={{padding:seniorMode?"12px 10px":"10px 8px",borderRadius:fr2,border:`1px solid ${sel?accentBg:FC.fieldBorder}`,background:sel?accentBg+"14":"transparent",color:sel?accentText:FC.t2,fontFamily:FONT,fontSize:fs(13),cursor:"pointer",fontWeight:sel?600:400,transition:"all .12s",textAlign:"center" as const,whiteSpace:"pre-wrap" as const,wordBreak:"keep-all" as const}}>
                      {opt.label}
                    </button>
                  )})}
                </div>
                {selOpt?.isEtc&&<div style={{marginTop:8}}>
                  <input value={pvKdtVals[field.id+"_etc"]||""} onChange={e=>setPvKdtVals(v=>({...v,[field.id+"_etc"]:e.target.value}))}
                    placeholder={(field as any).etcPh||"직접 입력해주세요."}
                    style={{width:"100%",height:fh,background:FC.fieldBg,border:`1px solid ${FC.fieldBorder}`,borderRadius:fr2,color:FC.t1,fontFamily:FONT,fontSize:fs(13),padding:"0 13px",outline:"none",boxSizing:"border-box" as const}}
                    onFocus={e=>e.target.style.borderColor=accentBg} onBlur={e=>e.target.style.borderColor=FC.fieldBorder}/>
                </div>}
                </div>
              })()}
            </div>
          })}
        </div>
        {/* 페이지 이동 */}
        <div style={{display:"flex",gap:10,marginTop:28}}>
          {isMultiPage&&pvPage>1&&<button onClick={()=>setPvPage(p=>p-1)} style={{flex:1,height:fh,borderRadius:fr2,border:`1px solid ${FC.fieldBorder}`,background:"transparent",color:FC.t2,fontFamily:FONT,fontSize:fs(14.5),fontWeight:700,cursor:"pointer"}}>이전</button>}
          {pvPage<3?<button onClick={()=>setPvPage(p=>p+1)} style={{flex:1,height:fh,borderRadius:fr2,border:"none",background:accentBg,color:cfg.cta.color||"#fff",fontFamily:FONT,fontSize:fs(14.5),fontWeight:700,cursor:"pointer"}}>다음</button>
          :<button style={{flex:1,height:fh,borderRadius:fr2,border:"none",background:accentBg,color:cfg.cta.color||"#fff",fontFamily:FONT,fontSize:fs(14.5),fontWeight:700,cursor:"pointer"}}>{cfg.cta.label}</button>}
        </div>
      </div>
    </div>
  }

  function renderLinkPanel() {
    const normalizedBrand = canonicalBrand(currentBrand)
    const isSF = normalizedBrand==="SNIPERFACTORY"
    const isSfacspace = normalizedBrand==="SFACSPACE"
    const usesCatchformDirect = isSF || isSfacspace
    const base = getBrandFormBaseUrl()
    const hasBase = base.length > 0
    const hasSaved = savedSlug.length > 0
    const formUrl = hasSaved ? buildPublicFormUrl(savedSlug) : ""
    const brandLabel = brandDisplayName(currentBrand)
    const brandColor = isSF ? "#529DFF" : currentBrand==="SFACSPACE" ? "#073B70" : A.red
    const urlPropName = usesCatchformDirect ? "CatchForm 직접 URL" : "Form Base URL"

    return <div style={{flex:1,overflowY:"auto" as const,padding:20,display:"flex",flexDirection:"column" as const,gap:14}}>

      {/* Brand indicator */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:A.r,background:A.card2,border:`1px solid ${A.border}`}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:brandColor,flexShrink:0}}/>
        <span style={{fontSize:12,fontWeight:600,color:A.t1}}>{brandLabel} 폼 링크</span>
        <span style={{fontSize:11,color:A.t3,marginLeft:"auto"}}>brand = "{currentBrand||"미선택"}"</span>
      </div>

      {/* Step 1: URL */}
      <div style={{padding:"14px 16px",borderRadius:A.r2,background:A.card,border:`1px solid ${A.border}`,boxShadow:A.shadow}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:hasBase?A.blue:A.card2,border:`1px solid ${hasBase?A.blue:A.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:hasBase?"#fff":A.t3,flexShrink:0}}>1</div>
          <div style={{fontSize:12.5,fontWeight:600,color:A.t1}}>배포 페이지 URL</div>
        </div>
        <div style={{fontSize:12,color:A.t3,marginBottom:10,lineHeight:1.5}}>{usesCatchformDirect?`${brandLabel} 폼은 외부 base URL 없이 캐치폼 직접 링크를 사용합니다.`:`환경변수 ${urlPropName} 에 배포된 페이지 주소를 입력하세요.`}</div>
        <div style={{padding:"9px 12px",borderRadius:A.r,background:A.card2,border:`1px solid ${hasBase?A.blue:A.border}`,fontSize:12.5,fontFamily:FONT,lineHeight:1.6,wordBreak:"break-all" as const,color:hasBase?A.t1:A.t3}}>
          {hasBase?base:`미설정 — 환경변수에서 입력`}
        </div>
      </div>

      {/* Step 2: Save */}
      <div style={{padding:"14px 16px",borderRadius:A.r2,background:A.card,border:`1px solid ${A.border}`,boxShadow:A.shadow}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:hasSaved?A.blue:A.card2,border:`1px solid ${hasSaved?A.blue:A.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:hasSaved?"#fff":A.t3,flexShrink:0}}>2</div>
          <div style={{fontSize:12.5,fontWeight:600,color:A.t1}}>폼 설정 저장</div>
        </div>
        <div style={{fontSize:12,color:A.t3,marginBottom:10,lineHeight:1.5}}>현재 설정을 Supabase에 저장하면 slug가 생성됩니다.</div>
        {hasSaved
          ?<div style={{padding:"8px 12px",borderRadius:A.r,background:A.blue2,border:`1px solid ${A.blue}33`,fontSize:12.5,fontFamily:FONT,fontWeight:600,color:A.blue}}>✓ {savedSlug}</div>
          :<Btn onClick={()=>setShowSave(true)} variant="blue" sm A={A}>DB에 저장하기</Btn>}
      </div>

      {/* Step 3: Final link */}
      <div style={{padding:"14px 16px",borderRadius:A.r2,background:A.card,border:`1.5px solid ${formUrl?A.blue:A.border}`,boxShadow:A.shadow,transition:"border .2s"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:formUrl?A.blue:A.card2,border:`1px solid ${formUrl?A.blue:A.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:formUrl?"#fff":A.t3,flexShrink:0}}>3</div>
          <div style={{fontSize:12.5,fontWeight:600,color:A.t1}}>신청 폼 링크</div>
        </div>
        {formUrl
          ?<>
            <textarea readOnly value={formUrl} style={{width:"100%",height:52,background:A.card2,border:`1px solid ${A.border}`,borderRadius:A.r,color:A.t2,fontFamily:FONT,fontSize:12,padding:"8px",outline:"none",resize:"none" as const,boxSizing:"border-box" as const,wordBreak:"break-all" as const,marginBottom:10}}/>
            <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{navigator.clipboard.writeText(formUrl);showToast("폼 링크 복사 완료! 🔗")}}
              style={{display:"flex",alignItems:"center",gap:5,height:30,padding:"0 12px",borderRadius:A.r,border:"none",background:"transparent",cursor:"pointer",color:A.t2,fontFamily:FONT,fontSize:12.5,fontWeight:500,transition:"background .1s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card2}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5a4.24 4.24 0 0 0 6 0l2-2a4.24 4.24 0 0 0-6-6L7 3M9.5 6.5a4.24 4.24 0 0 0-6 0l-2 2a4.24 4.24 0 0 0 6 6L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              복사
            </button>
            <button onClick={publishAndOpenForm}
              style={{display:"flex",alignItems:"center",gap:5,height:30,padding:"0 12px",borderRadius:A.r,border:"none",background:"transparent",cursor:"pointer",color:A.t2,fontFamily:FONT,fontSize:12.5,fontWeight:500,transition:"background .1s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card2}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 2h4v4M14 2l-7 7M6 4H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              열기
            </button>
          </div>
          </>
          :<div style={{fontSize:12,color:A.t3}}>{!hasBase&&!hasSaved?"1, 2 단계를 완료하면 링크가 생성됩니다.":!hasBase?`${urlPropName}을 먼저 설정해주세요.`:"설정을 DB에 저장하면 링크가 생성됩니다."}</div>}
      </div>
    </div>
  }

  function renderAnalyticsPage(){
    try{
	    const chartBlue="#5EA5F8", chartGreen="#49D38F", chartYellow="#F1C153", chartSlate="#8F9DB2", chartPurple="#9A86F4", chartOrange="#F39A62", chartCyan="#50C8D8", chartPink="#E879B3"
	    const accent=chartBlue, accentSoft=A.blue2
	    const rows=Array.isArray(analyticsRows)?analyticsRows:[]
	    const events=Array.isArray(analyticsEvents)?analyticsEvents:[]
	    const rawEvents=Array.isArray(analyticsTrashEvents)?analyticsTrashEvents:[]
	    const trashRecords=activeAnalyticsTrashRecords()
	    const eventMeta=(e:any)=>analyticsEventMeta(e)
	    const fields=getAnalyticsFields()
	    const colors=[chartBlue,chartGreen,chartYellow,chartSlate,chartPurple,chartOrange,chartCyan,chartPink]
    const pageName=(p:any)=>{
      const n=Number(p||1)
      const labels=cfg.form.pageLabels||[]
      if(isKdt){
        const def=["기본 정보","상세 정보","자격 요건 및 동의"]
        return labels[n-1]||def[n-1]||`섹션 ${n}`
      }
      return labels[n-1]||`섹션 ${n}`
    }
    const fieldTypeName=(type:any)=>FTYPES_DATA.find(ft=>ft.type===type)?.label||String(type||"질문")
    const fieldById:any={}
    const fieldsByPage:any={}
    fields.forEach((f:any)=>{fieldById[f.id]=f;const p=Number(f.page||1);(fieldsByPage[p]=fieldsByPage[p]||[]).push(f)})
    const analyticsPages=Object.keys(fieldsByPage).map(Number).sort((a,b)=>a-b)
    const currentQuestion=fields.find(f=>f.id===analyticsQuestionId)
    const selectedAnalyticsPage=analyticsPages.includes(Number(analyticsSection))?Number(analyticsSection):Number(currentQuestion?.page||analyticsPages[0]||1)
    const sectionQuestionFields=fields.filter(f=>Number(f.page||1)===selectedAnalyticsPage)
    const analyticsQuestionNeedle=analyticsQuestionQuery.trim().toLowerCase()
    const visibleSectionQuestionFields=analyticsQuestionNeedle
      ? sectionQuestionFields.filter((f:any)=>`${f.label||""} ${fieldTypeName(f.type)}`.toLowerCase().includes(analyticsQuestionNeedle))
      : sectionQuestionFields
    const activeField=sectionQuestionFields.find(f=>f.id===analyticsQuestionId)||sectionQuestionFields[0]||currentQuestion||fields[0]
    const grouped:any={}
    events.forEach((e:any)=>{const sid=e.session_id||e.id||"unknown";(grouped[sid]=grouped[sid]||[]).push(e)})
    const sessions=Object.keys(grouped).map(k=>(grouped[k]||[]).sort((a:any,b:any)=>new Date(a.created_at).getTime()-new Date(b.created_at).getTime())) as any[][]
    const draftResponseRows=sessions.filter(evs=>!evs.some(e=>e.event_type==="completed")).map(evs=>{
      const latest=[...evs].reverse().find(e=>e.event_type==="draft_saved")
      if(!latest)return null
      const meta=eventMeta(latest)
      const formData=Array.isArray(meta.draft_answers)?meta.draft_answers:[]
      if(!formData.length)return null
      const direct=(id:string)=>formData.find((item:any)=>item.answerKey===id)?.answer||""
      return {
        id:`draft:${latest.session_id||latest.id}`,
        __draft:true,
        __sessionId:latest.session_id||"",
        __page:latest.page||1,
        created_at:meta.draft_updated_at||latest.created_at,
        form_data:formData,
        name:direct("name"),
        phone:direct("phone"),
        email:direct("email"),
      }
    }).filter(Boolean) as any[]
    const responseRows=analyticsResponseScope==="draft"?draftResponseRows:rows
    const responseFields=getAnalyticsFields({includeConsentFields:true,includeAttributionFields:analyticsResponseScope==="submitted",rows:responseRows})
    const editResponseFields=editResponse?getAnalyticsFields({includeConsentFields:true,rows:[editResponse.row]}):[]
    const responseRowIds=responseRows.map((row:any)=>analyticsRowKey(row))
    const selectedResponseRows=responseRows.filter((row:any)=>selectedAnalyticsRowIds.includes(analyticsRowKey(row)))
    const canDeleteSelectedResponses=selectedResponseRows.length>0&&!analyticsSelectedDeleteBusy
    const allResponseRowsSelected=responseRowIds.length>0&&responseRowIds.every((id:string)=>selectedAnalyticsRowIds.includes(id))
    const toggleAllResponseRows=()=>setSelectedAnalyticsRowIds(prev=>{
      if(allResponseRowsSelected)return prev.filter(id=>!responseRowIds.includes(id))
      return Array.from(new Set([...prev,...responseRowIds]))
    })
    const toggleResponseRow=(id:string)=>setSelectedAnalyticsRowIds(prev=>prev.includes(id)?prev.filter(item=>item!==id):[...prev,id])
    const duplicateLookupValue=(row:any,keys:string[],labels:string[])=>{
      const direct=keys.map(key=>row?.[key]).find(value=>value!==undefined&&value!==null&&String(value).trim()!=="")
      if(direct!==undefined&&direct!==null&&String(direct).trim()!=="")return String(direct)
      const labelSet=new Set(labels.map(label=>label.replace(/\s+/g,"").toLowerCase()))
      const fd=Array.isArray(row?.form_data)?row.form_data:[]
      const hit=fd.find((item:any)=>keys.includes(String(item?.answerKey||"")))||fd.find((item:any)=>labelSet.has(String(item?.question||"").replace(/\s+/g,"").toLowerCase()))
      const answer=hit?.answer
      return answer===undefined||answer===null?"":Array.isArray(answer)?answer.join(" / "):String(answer)
    }
    const duplicateResponseKey=(row:any)=>{
      if(analyticsResponseScope!=="submitted"||row?.__draft||row?.user_id)return""
      const name=duplicateLookupValue(row,["name","applicant_name","manager_name","full_name"],["이름","성함","성명","지원자명","담당자명"]).replace(/\s+/g,"").trim().toLowerCase()
      const phone=duplicateLookupValue(row,["phone","contact_phone","mobile","tel"],["전화번호","휴대폰번호","연락처","휴대폰"]).replace(/\D/g,"")
      const email=duplicateLookupValue(row,["email","contact_email"],["이메일","메일","이메일주소"]).trim().toLowerCase()
      return name&&phone&&email?`${name}::${phone}::${email}`:""
    }
    const responseRowGroups=(()=>{
      const groups:any[]=[]
      const byKey=new Map<string,any>()
      responseRows.forEach((row:any)=>{
        const duplicateKey=duplicateResponseKey(row)
        if(!duplicateKey){
          groups.push({key:analyticsRowKey(row),duplicateKey:"",rows:[row]})
          return
        }
        const existing=byKey.get(duplicateKey)
        if(existing)existing.rows.push(row)
        else{
          const group={key:`duplicate:${duplicateKey}`,duplicateKey,rows:[row]}
          byKey.set(duplicateKey,group)
          groups.push(group)
        }
      })
      return groups
    })()
    const duplicateFoldedCount=responseRows.length-responseRowGroups.length
    const toggleDuplicateResponseGroup=(key:string)=>setExpandedDuplicateResponseGroups(prev=>prev.includes(key)?prev.filter(item=>item!==key):[...prev,key])
    const isResizableAnalyticsField=(field:any)=>!field.attributionField&&(field.type==="text"||field.type==="textarea")
    const analyticsDefaultColumnWidth=(field:any,fileCount=0)=>field.attributionField
      ? (["landing_page","referrer"].includes(String(field.answerKey||field.id))?280:170)
      : isResizableAnalyticsField(field)?440:fileCount?260:220
    const analyticsColumnMeta=responseFields.map((field:any)=>{
      const fileCount=analyticsFieldFiles(responseRows,field).length
      const resizable=isResizableAnalyticsField(field)
      const width=Math.max(resizable?300:analyticsDefaultColumnWidth(field,fileCount),analyticsColumnWidths[field.id]||analyticsDefaultColumnWidth(field,fileCount))
      return{field,fileCount,resizable,width}
    })
    const analyticsControlColumnWidth=150
    const analyticsDateColumnWidth=190
    const analyticsTableMinWidth=Math.max(1100,analyticsControlColumnWidth+analyticsDateColumnWidth+analyticsColumnMeta.reduce((sum:number,item:any)=>sum+item.width,0))
    const startAnalyticsColumnResize=(event:React.MouseEvent,field:any,currentWidth:number)=>{
      event.preventDefault()
      event.stopPropagation()
      const startX=event.clientX
      const startWidth=currentWidth
      const onMove=(moveEvent:MouseEvent)=>{
        const nextWidth=Math.max(300,Math.min(960,startWidth+moveEvent.clientX-startX))
        setAnalyticsColumnWidths(prev=>({...prev,[field.id]:nextWidth}))
      }
      const onUp=()=>{
        window.removeEventListener("mousemove",onMove)
        window.removeEventListener("mouseup",onUp)
      }
      window.addEventListener("mousemove",onMove)
      window.addEventListener("mouseup",onUp)
    }
    const completedSessions=sessions.filter(evs=>evs.some(e=>e.event_type==="completed")).length
    const sessionCount=sessions.length||rows.length
    const completionRate=sessionCount?Math.min(100,Math.round(((completedSessions||rows.length)/sessionCount)*10000)/100):0
    const durations=sessions.map(evs=>{const done=evs.find(e=>e.event_type==="completed");return done&&evs[0]?Math.max(0,(new Date(done.created_at).getTime()-new Date(evs[0].created_at).getTime())/1000):0}).filter(Boolean)
    const avgSec=durations.length?Math.round(durations.reduce((a,b)=>a+b,0)/durations.length):0
    const avgTime=`${Math.floor(avgSec/60)}:${String(avgSec%60).padStart(2,"0")}`
    const dropMap:any={}
    sessions.filter(evs=>!evs.some(e=>e.event_type==="completed")).forEach((evs:any[])=>{
      const reversed=[...evs].reverse()
      const last=reversed.find(e=>e.event_type!=="started")||reversed[0]||{}
      const fieldEvent=reversed.find(e=>e.field_id||e.field_label)
      const matched=fieldEvent?.field_id?fieldById[fieldEvent.field_id]:fields.find((f:any)=>f.label===fieldEvent?.field_label)
      const pageNo=Number(matched?.page||fieldEvent?.page||last?.page||1)
      const fallback=(fieldsByPage[pageNo]||[])[0]||fields[0]
      const question=matched?.label||fieldEvent?.field_label||fallback?.label||"질문 미확인"
      const section=pageName(pageNo)
      const key=`${section}__${question}`
      if(!dropMap[key])dropMap[key]={key,section,question,count:0,page:pageNo}
      dropMap[key].count+=1
    })
    const dropRows=Object.keys(dropMap).map(k=>dropMap[k]).sort((a:any,b:any)=>b.count-a.count)
    const dropTotal=dropRows.reduce((a:any,b:any)=>a+b.count,0)
    const countRows=activeField?rows.reduce((acc:any,row:any)=>{analyticsValues(row,activeField).forEach(v=>{acc[v]=(acc[v]||0)+1});return acc},{}):{}
    const countEntries=Object.keys(countRows).map(k=>[k,countRows[k]])
    const totalCount=countEntries.reduce((a:any,item:any)=>a+item[1],0)
    const listQuestionTypes=["text","name","phone","email","date","time","textarea","file"]
    const isListQuestion=!!activeField&&listQuestionTypes.includes(activeField.type)
    const directAnswerRows=activeField?rows.map(row=>({row,raw:analyticsRawAnswer(row,activeField),date:fmtAnalyticsDate(row.created_at)})).filter(item=>!isEmptyAnalyticsAnswer(item.raw)):[]
    const activeFileCount=activeField?analyticsFieldFiles(rows,activeField).length:0
    const choiceDirectRows=activeField&&!isListQuestion?rows.map(row=>{
      const raw=analyticsRawAnswer(row,activeField)
      const vals=Array.isArray(raw)?raw:(raw?[raw]:[])
      const answers=vals.map((v:any)=>analyticsOptionLabel(activeField,v)).filter(v=>v.trim().startsWith("기타:")).map(v=>v.replace(/^기타:\s*/,"").trim()).filter(Boolean)
      return {row,answers,date:fmtAnalyticsDate(row.created_at)}
    }).filter(item=>item.answers.length>0):[]
    let pieDeg=0
    const pieSlices=countEntries.map((item:any,i)=>{
      const label=item[0],count=item[1]
      const part=totalCount?(count/totalCount)*360:0
      const start=pieDeg
      pieDeg+=part
      return {label,count,start,end:pieDeg,color:colors[i%colors.length],pct:totalCount?Math.round((count/totalCount)*1000)/10:0}
    })
    const polar=(cx:number,cy:number,r:number,deg:number)=>{const rad=(deg-90)*Math.PI/180;return {x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)}}
    const piePath=(cx:number,cy:number,r:number,start:number,end:number)=>{
      const s=polar(cx,cy,r,end),e=polar(cx,cy,r,start)
      const large=end-start<=180?0:1
      return `M ${cx} ${cy} L ${e.x} ${e.y} A ${r} ${r} 0 ${large} 1 ${s.x} ${s.y} Z`
    }
    const byDate=rows.reduce((acc:any,row:any)=>{const d=fmtAnalyticsDate(row.created_at)[0]||"날짜 없음";acc[d]=(acc[d]||0)+1;return acc},{})
	    const periodRows=Object.keys(byDate).map(k=>[k,byDate[k]]).sort((a:any,b:any)=>String(b[0]).localeCompare(String(a[0])))
	    const periodChartRows=[...periodRows].sort((a:any,b:any)=>String(a[0]).localeCompare(String(b[0]))).slice(-14)
	    const maxPeriodCount=Math.max(1,...periodChartRows.map((item:any)=>Number(item[1])||0))
	    const dayOf=(v:any)=>fmtAnalyticsDate(v)[0]||"날짜 없음"
	    const countryName=(code:string)=>{
	      const m:any={KR:"대한민국",US:"미국",JP:"일본",CN:"중국",VN:"베트남",TH:"태국",ID:"인도네시아",PH:"필리핀",SG:"싱가포르",GB:"영국",DE:"독일",FR:"프랑스",AU:"호주",CA:"캐나다"}
	      const c=String(code||"").toUpperCase()
	      return m[c]||c||"미확인"
	    }
	    const regionName=(value:string)=>{
	      const raw=String(value||"").trim()
	      const key=raw.toUpperCase()
	      const m:any={
	        11:"서울",26:"부산",27:"대구",28:"인천",29:"광주",30:"대전",31:"울산",36:"세종",41:"경기",42:"강원",43:"충북",44:"충남",45:"전북",46:"전남",47:"경북",48:"경남",49:"제주",
	        SEOUL:"서울",BUSAN:"부산",DAEGU:"대구",INCHEON:"인천",GWANGJU:"광주",DAEJEON:"대전",ULSAN:"울산",SEJONG:"세종",
	        GYEONGGI:"경기",GYEONGGI_DO:"경기",GYEONGGI_DO_PROVINCE:"경기",GANGWON:"강원",GANGWON_DO:"강원",GANGWON_STATE:"강원",
	        CHUNGBUK:"충북",CHUNGCHEONGBUK_DO:"충북",CHUNGNAM:"충남",CHUNGCHEONGNAM_DO:"충남",
	        JEONBUK:"전북",JEOLLABUK_DO:"전북",JEONNAM:"전남",JEOLLANAM_DO:"전남",
	        GYEONGBUK:"경북",GYEONGSANGBUK_DO:"경북",GYEONGNAM:"경남",GYEONGSANGNAM_DO:"경남",JEJU:"제주",JEJU_DO:"제주",
	        "SEOUL-SI":"서울","BUSAN-SI":"부산","DAEGU-SI":"대구","INCHEON-SI":"인천","GWANGJU-SI":"광주","DAEJEON-SI":"대전","ULSAN-SI":"울산"
	      }
	      return m[key]||raw
	    }
	    const placeFromMeta=(meta:any)=>{
	      const country=countryName(meta?.country||"")
	      const explicit=String(meta?.geo_label||"").trim()
	      const city=regionName(meta?.city||"")
	      const region=regionName(meta?.region||"")
	      const district=regionName(meta?.district||meta?.borough||meta?.county||"")
	      const neighborhood=regionName(meta?.neighborhood||meta?.dong||meta?.suburb||"")
	      const place=[region,city,district,neighborhood].filter(Boolean).filter((v:string,i:number,a:string[])=>a.indexOf(v)===i).join(" · ")
	      if(explicit)return explicit
	      if(country==="대한민국")return place?`대한민국 · ${place}`:"대한민국 · 지역 미확인"
	      if(country&&country!=="미확인")return place?`${country} · ${place}`:country
	      return place||"미확인"
	    }
	    const UNKNOWN_SOURCE_LABEL="출처 미확인"
	    const normalizeSourceLabel=(value:any)=>{
	      const raw=String(value||"").trim()
	      if(!raw||raw.toLowerCase()==="direct"||raw==="직접 유입")return UNKNOWN_SOURCE_LABEL
	      return raw
	    }
	    const sourceFromMeta=(meta:any)=>normalizeSourceLabel(meta?.source||meta?.utm_source||meta?.referrer_host||"")
	    const sourceBySession:any={}
	    const sessionSummaries=sessions.map((evs:any[])=>{
	      const first=evs[0]||{}
	      const metaEvent=evs.find(e=>{const m=eventMeta(e);return ["started","page_view"].includes(String(e.event_type||""))&&(m.geo_label||m.latitude||m.country||m.region||m.city||m.district||m.neighborhood)})||evs.find(e=>{const m=eventMeta(e);return m.geo_label||m.latitude||m.country||m.region||m.city||m.district||m.neighborhood})||first
	      const meta=eventMeta(metaEvent)
	      const source=sourceFromMeta(meta)
	      const country=countryName(meta.country||"")
	      const region=regionName(meta.region||"")
	      const city=regionName(meta.city||"")
	      const location=placeFromMeta(meta)
	      const completed=evs.some(e=>e.event_type==="completed")
	      sourceBySession[first.session_id||"unknown"]=source
	      return{session:first.session_id||"unknown",source,country,region,city,location,completed,startedAt:first.created_at}
	    })
    rows.forEach((row:any)=>{
      if(!sessionSummaries.length){
        const src=normalizeSourceLabel(row.referral_source)
        sourceBySession[row.id]=src
      }
    })
    const sourceMap:any={}
    sessionSummaries.forEach(s=>{
      if(!sourceMap[s.source])sourceMap[s.source]={label:s.source,participation:0,complete:0,share:0,link:0}
      sourceMap[s.source].participation+=1
      if(s.completed)sourceMap[s.source].complete+=1
    })
    if(!sessionSummaries.length){
      rows.forEach((row:any)=>{const src=normalizeSourceLabel(row.referral_source);sourceMap[src]=sourceMap[src]||{label:src,participation:0,complete:0,share:0,link:0};sourceMap[src].participation+=1;sourceMap[src].complete+=1})
    }
    events.forEach((e:any)=>{
      const m=eventMeta(e)
      const sid=e.session_id||"unknown"
      const src=sourceBySession[sid]||sourceFromMeta(m)
      if(!sourceMap[src])sourceMap[src]={label:src,participation:0,complete:0,share:0,link:0}
      if(String(e.event_type).includes("share"))sourceMap[src].share+=1
      if(e.event_type==="link_click")sourceMap[src].link+=1
    })
    const sourceEntries=Object.keys(sourceMap).map(k=>({...sourceMap[k],conversion:sourceMap[k].participation?Math.round((sourceMap[k].complete/sourceMap[k].participation)*1000)/10:0})).sort((a:any,b:any)=>b.participation-a.participation)
    const sourceTotal=sourceEntries.reduce((a:any,b:any)=>a+b.participation,0)
    let donutDeg=0
    const donutSlices=sourceEntries.map((s:any,i:number)=>{const part=sourceTotal?(s.participation/sourceTotal)*360:0;const start=donutDeg;donutDeg+=part;return{...s,start,end:donutDeg,color:colors[i%colors.length],pct:sourceTotal?Math.round((s.participation/sourceTotal)*1000)/10:0}})
	    const donutPath=(cx:number,cy:number,r:number,start:number,end:number)=>{
	      const s=polar(cx,cy,r,start),e=polar(cx,cy,r,end)
	      const large=end-start<=180?0:1
	      return`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
	    }
	    const donutGap=(slice:any)=>Math.min(1.5,Math.max(0,(slice.end-slice.start)/4))
	    const donutFillPath=(cx:number,cy:number,ro:number,ri:number,start:number,end:number)=>{
	      const o1=polar(cx,cy,ro,end),o2=polar(cx,cy,ro,start),i1=polar(cx,cy,ri,start),i2=polar(cx,cy,ri,end)
	      const large=end-start<=180?0:1
	      return`M ${o2.x} ${o2.y} A ${ro} ${ro} 0 ${large} 1 ${o1.x} ${o1.y} L ${i2.x} ${i2.y} A ${ri} ${ri} 0 ${large} 0 ${i1.x} ${i1.y} Z`
	    }
	    const locationMap:any={}
	    sessionSummaries.forEach((s:any)=>{
	      const label=s.location||"미확인"
	      locationMap[label]=(locationMap[label]||0)+1
	    })
	    const locationSource="접속 metadata"
	    const locationEntries=Object.keys(locationMap).map(k=>[k,locationMap[k]]).sort((a:any,b:any)=>Number(b[1])-Number(a[1]))
	    const locationTotal=locationEntries.reduce((a:any,b:any)=>a+Number(b[1]||0),0)
    const shareMap:any={}
    events.filter((e:any)=>String(e.event_type).includes("share")).forEach((e:any)=>{
      const m=eventMeta(e)
      const ch=m.channel||m.share_channel||m.platform||"공유"
      if(!shareMap[ch])shareMap[ch]={channel:ch,total:0,unique:new Set()}
      shareMap[ch].total+=1
      shareMap[ch].unique.add(e.session_id||e.id)
    })
    const shareEntries=Object.keys(shareMap).map(k=>({channel:k,total:shareMap[k].total,unique:shareMap[k].unique.size})).sort((a:any,b:any)=>b.total-a.total)
    const activityMap:any={}
    sessionSummaries.forEach(s=>{const d=dayOf(s.startedAt);activityMap[d]=activityMap[d]||{date:d,participation:0,complete:0,share:0,link:0};activityMap[d].participation+=1;if(s.completed)activityMap[d].complete+=1})
    events.forEach((e:any)=>{const d=dayOf(e.created_at);activityMap[d]=activityMap[d]||{date:d,participation:0,complete:0,share:0,link:0};if(String(e.event_type).includes("share"))activityMap[d].share+=1;if(e.event_type==="link_click")activityMap[d].link+=1})
    const activityEntries=Object.keys(activityMap).map(k=>activityMap[k]).sort((a:any,b:any)=>String(a.date).localeCompare(String(b.date))).slice(-10)
    const maxActivity=Math.max(1,...activityEntries.flatMap((d:any)=>[d.participation,d.complete,d.share,d.link]))
    const isQrEvent=(e:any)=>{
      const m=eventMeta(e)
      return e.event_type==="qr_scan"||m.cf_qr==="1"||m.utm_source==="qr"||m.utm_medium==="qrcode"||String(m.source||"").toLowerCase()==="qr"
    }
    const normalizeQrUrl=(value:any)=>{
      const raw=String(value||"").trim()
      if(!raw)return""
      try{
        const url=new URL(raw)
        url.hash=""
        return url.toString().replace(/\/$/,"")
      }catch{
        return raw.replace(/\/$/,"")
      }
    }
    const detailQrLinks=(cfg.integrations?.qrLinks||[]).filter(link=>link.type==="detail")
    const detailQrUrls=new Set(detailQrLinks.map(link=>normalizeQrUrl(link.url)).filter(Boolean))
    const detailQrCodes=new Set(detailQrLinks.map(link=>String(link.code||"")).filter(Boolean))
    const qrEventSource=(rawEvents.length?rawEvents:events).filter((event:any)=>!analyticsTrashTypes.includes(event.event_type))
    const qrEventScope=(e:any):"form"|"detail"|"unknown"=>{
      const m=eventMeta(e)
      const explicitType=String(m.qr_type||m.type||"").toLowerCase()
      if(explicitType==="form")return"form"
      if(explicitType==="detail"||String(m.d||"")==="1")return"detail"
      const target=normalizeQrUrl(m.qr_target||m.target_url||m.to||m.url)
      const code=String(m.qr_code||m.code||m.q||"")
      if((target&&detailQrUrls.has(target))||(code&&detailQrCodes.has(code)))return"detail"
      if(e.event_type==="qr_scan")return"unknown"
      return"form"
    }
    const allQrEvents=qrEventSource.filter(isQrEvent)
    const hasDetailQr=detailQrLinks.length>0||allQrEvents.some((e:any)=>qrEventScope(e)==="detail")
    const activeQrScope=hasDetailQr?qrAnalyticsScope:"form"
    const matchesQrScope=(e:any)=>{
      const scope=qrEventScope(e)
      return scope===activeQrScope||scope==="unknown"
    }
    const qrEvents=allQrEvents.filter((e:any)=>matchesQrScope(e))
    const qrScanEvents=qrEventSource.filter((e:any)=>matchesQrScope(e)&&(e.event_type==="qr_scan"||(isQrEvent(e)&&e.event_type==="started"&&!eventMeta(e).cf_qr_redirected)))
    const qrVisitEvents=qrEventSource.filter((e:any)=>matchesQrScope(e)&&isQrEvent(e)&&["started","page_view","completed"].includes(e.event_type))
    const qrScanTotal=qrScanEvents.length
    const qrUniqueScans=new Set(qrScanEvents.map((e:any)=>e.session_id||e.id)).size
    const qrVisits=activeQrScope==="detail"?qrScanTotal:(new Set(qrVisitEvents.map((e:any)=>e.session_id||e.id)).size||qrUniqueScans)
    const qrVisitLabel=activeQrScope==="detail"?"상세페이지 이동":"폼 방문"
    const qrBaseEvents=qrScanEvents.length?qrScanEvents:qrEvents
    const qrDateKeys=Array.from(new Set(qrBaseEvents.map((e:any)=>dayOf(e.created_at)))).sort().slice(-7)
    const qrActivityRows=qrDateKeys.map((d:string)=>{
      const scan=qrScanEvents.filter((e:any)=>dayOf(e.created_at)===d)
      const visit=qrVisitEvents.filter((e:any)=>dayOf(e.created_at)===d)
      return {date:d,total:scan.length,unique:new Set(scan.map((e:any)=>e.session_id||e.id)).size,visits:activeQrScope==="detail"?scan.length:new Set(visit.map((e:any)=>e.session_id||e.id)).size}
    })
    const qrActivityMax=Math.max(1,...qrActivityRows.flatMap((d:any)=>[d.total,d.unique,d.visits]))
    const qrCounterEntries=(items:any[],getLabel:(e:any)=>string,total=items.length)=>{
      const map:any={}
      items.forEach((e:any)=>{const label=getLabel(e)||"미확인";map[label]=(map[label]||0)+1})
      return Object.keys(map).map(k=>({label:k,count:map[k],pct:total?Math.round((map[k]/total)*1000)/10:0})).sort((a:any,b:any)=>b.count-a.count)
    }
    const qrFormLocationEvents=qrEvents.filter((e:any)=>["started","page_view"].includes(String(e.event_type||"")))
    const qrLocationEvents=Array.from(qrFormLocationEvents.reduce((map:any,e:any)=>{
      const sid=e.session_id||e.id
      const current=map.get(sid)
      const meta=eventMeta(e)
      const currentMeta=current?eventMeta(current):{}
      const score=(m:any)=>(m.geo_source==="browser_geolocation"?10:0)+(m.geo_label?4:0)+(m.latitude?2:0)+(m.city||m.region?1:0)
      if(!current||score(meta)>score(currentMeta))map.set(sid,e)
      return map
    },new Map()).values()) as any[]
    const qrLocationBase=qrLocationEvents.length?qrLocationEvents:qrBaseEvents
    const qrCountryEntries=qrCounterEntries(qrLocationBase,(e:any)=>countryName(eventMeta(e).country||""),qrLocationBase.length)
    const qrCityEntries=qrCounterEntries(qrLocationBase,(e:any)=>placeFromMeta(eventMeta(e)),qrLocationBase.length)
    const qrOsName=(m:any)=>{
      const raw=String(m.device_os||m.os||m.platform||m.user_agent||"")
      if(/android/i.test(raw))return"Android"
      if(/ios|iphone|ipad|ipod/i.test(raw))return"iOS"
      if(/windows|win/i.test(raw))return"Windows"
      if(/mac|os x|macos/i.test(raw))return"macOS"
      if(/chrome os|cros/i.test(raw))return"Chrome OS"
      if(/linux/i.test(raw))return"Linux"
      return raw||"미확인"
    }
    const qrOsEntries=qrCounterEntries(qrBaseEvents,(e:any)=>qrOsName(eventMeta(e)))
    const qrHourLabels=Array.from({length:24},(_,i)=>`${String(i).padStart(2,"0")}시`)
    const qrDayLabels=["일","월","화","수","목","금","토"]
    const qrHeat:any={}
    qrBaseEvents.forEach((e:any)=>{
      const dt=new Date(e.created_at)
      if(Number.isNaN(dt.getTime()))return
      const key=`${dt.getDay()}-${dt.getHours()}`
      qrHeat[key]=(qrHeat[key]||0)+1
    })
    const qrHeatMax=Math.max(1,...Object.keys(qrHeat).map(k=>qrHeat[k]))
    const tabs=[
      {id:"questions",label:"질문별 인사이트",icon:<path d="M4 13V7M8 13V3M12 13V9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>},
      {id:"responses",label:"응답별 데이터",icon:<path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>},
      {id:"period",label:"기간별 인사이트",icon:<><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>},
	      {id:"dropoff",label:"질문별 이탈률",icon:<path d="M4 3.5h5v9H4M9 8h5M12 5.8 14.2 8 12 10.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>},
	      {id:"qr",label:"QR 데이터",dividerBefore:true,icon:<><path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M10 10h1.5v1.5H13V13h-3z" fill="currentColor"/></>},
    ] as any[]
    const activeAnalyticsTab=tabs.some(t=>t.id===analyticsTab)?analyticsTab:"responses"
    const metric=(icon:any,value:string,label:string,color:string=accent)=><div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:18,display:"flex",alignItems:"center",gap:14,minHeight:88,boxShadow:A.shadow}}>
      <div style={{width:46,height:46,borderRadius:A.r,background:color===accent?accentSoft:color+"18",display:"flex",alignItems:"center",justifyContent:"center",color}}><svg width="22" height="22" viewBox="0 0 16 16" fill="none">{icon}</svg></div>
      <div style={{minWidth:0}}><div style={{fontSize:28,fontWeight:700,color:A.t1,letterSpacing:"-.8px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:210,fontVariantNumeric:"tabular-nums" as const}}>{value}</div><div style={{fontSize:12.5,fontWeight:500,color:A.t3,marginTop:3}}>{label}</div></div>
    </div>
    const emptyState=(text:string)=><div style={{background:A.card,border:`1px dashed ${A.border2}`,borderRadius:A.r2,padding:28,textAlign:"center" as const,color:A.t3,fontSize:13}}>{text}</div>
    const infoTitle=(label:string,tip:string)=><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12,position:"relative" as const}}>
      <span style={{fontSize:15,fontWeight:700,color:A.t1}}>{label}</span>
      <span
        onMouseEnter={()=>setAnalyticsInfoTip(label)}
        onMouseLeave={()=>setAnalyticsInfoTip("")}
        onFocus={()=>setAnalyticsInfoTip(label)}
        onBlur={()=>setAnalyticsInfoTip("")}
        tabIndex={0}
        aria-label={`${label} 데이터 설명`}
        style={{width:18,height:18,borderRadius:"50%",border:`1px solid ${A.border2}`,color:A.t3,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,cursor:"help",background:A.card2,position:"relative" as const,outline:"none"}}>
        ?
        {analyticsInfoTip===label&&<div style={{position:"absolute" as const,left:"50%",top:25,transform:"translateX(-50%)",width:280,padding:"11px 12px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card,color:A.t2,boxShadow:A.shadow,fontSize:12.5,fontWeight:500,lineHeight:1.55,textAlign:"left" as const,zIndex:50,pointerEvents:"none" as const,whiteSpace:"normal" as const}}>
          <div style={{fontSize:12,fontWeight:700,color:A.t1,marginBottom:5}}>{label} 데이터 기준</div>
          {tip}
        </div>}
      </span>
    </div>
    const movePeriodTip=(scope:string,e:any,data:{title:string;color:string;lines:string[]})=>{
      const card=(e.currentTarget as HTMLElement).closest("[data-period-card]") as HTMLElement|null
      const r=card?.getBoundingClientRect()
      if(r)setPeriodHover({scope,x:e.clientX-r.left+14,y:e.clientY-r.top+14,...data})
    }
    const periodTip=(scope:string)=>periodHover?.scope===scope&&<div style={{position:"absolute" as const,left:periodHover.x,top:periodHover.y,background:A.card,border:`1px solid ${periodHover.color}`,borderRadius:A.r,padding:"12px 14px",boxShadow:A.shadow,minWidth:190,pointerEvents:"none" as const,zIndex:20}}>
      <div style={{display:"flex",alignItems:"center",gap:8,fontSize:14,fontWeight:600,color:A.t1,marginBottom:7}}>
        <span style={{width:10,height:10,borderRadius:"50%",background:periodHover.color,flexShrink:0}}/>{periodHover.title}
      </div>
      {periodHover.lines.map((line:string,idx:number)=><div key={idx} style={{fontSize:13,color:A.t2,lineHeight:1.55}}>{line}</div>)}
    </div>
	    const movePieTip=(i:number,e:any)=>{
	      const wrap=(e.currentTarget.ownerSVGElement as SVGElement)?.parentElement
	      const r=wrap?.getBoundingClientRect()
	      if(r)setAnalyticsHoverPoint({x:e.clientX-r.left,y:e.clientY-r.top})
	      setAnalyticsHoverSlice(i)
	    }
	    const topIconButton=(key:string,label:string,onClick:()=>void,icon:any,color=A.t2)=><div style={{position:"relative" as const}}>
	      <button
	        onClick={onClick}
	        onMouseEnter={()=>setAnalyticsTopTip(key)}
	        onMouseLeave={()=>setAnalyticsTopTip("")}
	        aria-label={label}
	        style={{width:34,height:34,borderRadius:A.r,border:"none",background:"transparent",color:color===A.red?A.red:A.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
	        <svg width="17" height="17" viewBox="0 0 16 16" fill="none">{icon}</svg>
	      </button>
	      {analyticsTopTip===key&&<div style={{position:"absolute" as const,top:39,left:"50%",transform:"translateX(-50%)",padding:"5px 8px",borderRadius:6,background:A.t1,color:A.card,fontSize:11.5,fontWeight:600,whiteSpace:"nowrap" as const,zIndex:1000,boxShadow:A.shadow,pointerEvents:"none" as const}}>{label}</div>}
	    </div>
	    return <div style={{width,height,display:"flex",flexDirection:"column" as const,background:A.bg,color:A.t1,fontFamily:FONT,overflow:"hidden",position:"relative" as const,WebkitFontSmoothing:"antialiased"}}>
      {renderEditorTabsStrip()}
      <div style={{height:58,background:A.card,borderBottom:`1px solid ${A.border}`,display:"flex",alignItems:"center",padding:"0 20px",gap:12,flexShrink:0}}>
        <button onClick={returnToBuilderFromAnalytics} style={{height:32,padding:"0 10px",display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",borderRadius:A.r,cursor:"pointer",color:A.t2,fontSize:12.5,fontWeight:500,fontFamily:FONT}}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>편집으로</span>
        </button>
        <div style={{width:1,height:18,background:A.border}}/>
        <div style={{minWidth:0}}>
          <div style={{fontSize:14,fontWeight:700,color:A.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:280}}>{loadedName||"응답 및 분석"}</div>
        </div>
        <span style={{padding:"3px 8px",borderRadius:6,background:A.card2,fontSize:11.5,fontWeight:600,color:A.t3,flexShrink:0,whiteSpace:"nowrap" as const}}>응답 {rows.length}건</span>
        <div style={{flex:1}}/>
	        <div style={{position:"relative" as const}}>
	          {topIconButton("trash-menu","응답 삭제 관리",()=>{setAnalyticsTopTip("");setShowAnalyticsDeleteMenu(v=>!v)},<><path d="M3 5h10M6 5V3.5h4V5M5 7v5M8 7v5M11 7v5M4 5l.55 8.2c.04.45.4.8.85.8h5.2c.45 0 .81-.35.85-.8L12 5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/>{trashRecords.length>0&&<circle cx="13" cy="3" r="2.2" fill={A.red}/>}</>,A.red)}
	          {showAnalyticsDeleteMenu&&<div style={{position:"absolute" as const,top:42,right:0,width:184,padding:6,borderRadius:A.r2,background:A.card,boxShadow:"0 1px 2px rgba(16,24,40,.08),0 16px 40px -10px rgba(16,24,40,.28)",zIndex:1002}}>
	            <button onClick={()=>{setShowAnalyticsDeleteMenu(false);setShowDeleteAllAnalytics(true)}} style={{width:"100%",height:38,padding:"0 11px",border:"none",borderRadius:9,background:"transparent",color:A.red,fontFamily:FONT,fontSize:13.5,fontWeight:700,textAlign:"left" as const,cursor:"pointer"}}>응답 전체 삭제</button>
	            <button onClick={()=>{setShowAnalyticsDeleteMenu(false);setShowAnalyticsTrash(true)}} style={{width:"100%",height:38,padding:"0 11px",border:"none",borderRadius:9,background:"transparent",color:A.t1,fontFamily:FONT,fontSize:13.5,fontWeight:600,textAlign:"left" as const,cursor:"pointer"}}>휴지통{trashRecords.length>0?` ${trashRecords.length}`:""}</button>
	          </div>}
	        </div>
	        {topIconButton("refresh","새로고침",loadAnalytics,<path d="M13 3v4H9M3 13V9h4M12.2 8.8A4.5 4.5 0 0 1 4.5 12M3.8 7.2A4.5 4.5 0 0 1 11.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>)}
	        {activeAnalyticsTab==="responses"&&<div style={{position:"relative" as const}}>
	          <PanelSelect value={analyticsCsvSort} onChange={v=>setAnalyticsCsvSort(v as "desc"|"asc")} A={A} height={34} fontSize={12.5} fontWeight={600} radius={8} padX={10} width={134}
	            options={[{value:"desc",label:"날짜 내림차순"},{value:"asc",label:"날짜 오름차순"}]}/>
	        </div>}
	        {activeAnalyticsTab==="responses"&&<button onClick={()=>exportAnalyticsCsv(responseRows)} style={{height:34,padding:"0 13px",borderRadius:A.r,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:600,boxShadow:"0 1px 2px rgba(49,130,246,.35)",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
	          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>시트 다운로드
	        </button>}
      </div>
      <div style={{height:44,background:A.card,boxShadow:`inset 0 -1px 0 ${A.border}`,display:"flex",alignItems:"center",padding:"0 24px",gap:22,flexShrink:0}}>
        {tabs.map(t=>{const on=activeAnalyticsTab===t.id;return <React.Fragment key={t.id}>
          {t.dividerBefore&&<div style={{width:1,height:18,background:A.border,margin:"0 0 0 -4px"}}/>}
          <button onClick={()=>setAnalyticsTab(t.id)}
          style={{height:44,padding:"0 2px",borderRadius:0,border:"none",background:"transparent",color:on?A.t1:A.t3,fontFamily:FONT,fontSize:13.5,fontWeight:on?700:500,cursor:"pointer",display:"flex",alignItems:"center",gap:7,boxShadow:on?`inset 0 -2px 0 ${A.blue}`:"none"}}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">{t.icon}</svg>{t.label}
        </button>
        </React.Fragment>})}
      </div>
      <div style={{flex:1,minHeight:0,overflow:activeAnalyticsTab==="responses"?"hidden":"auto",padding:"22px 28px 36px",boxSizing:"border-box" as const,background:A.card}}>
        <div style={{maxWidth:1280,margin:"0 auto",height:activeAnalyticsTab==="responses"?"100%":"auto"}}>
        {analyticsLoading?<div style={{fontSize:14,color:A.t2}}>불러오는 중...</div>:analyticsErr?<div style={{fontSize:14,color:A.red}}>{analyticsErr}</div>:<>
          {activeAnalyticsTab==="responses"&&<div style={{height:"100%",minHeight:0,display:"flex",flexDirection:"column" as const}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" as const,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{fontSize:18,fontWeight:700,color:A.t1,letterSpacing:"-.2px"}}>응답별 데이터</div>
                <div style={{height:26,padding:"0 12px",borderRadius:999,background:A.card2,border:`1px solid ${A.border}`,color:A.t2,display:"flex",alignItems:"center",fontSize:12.5,fontWeight:600}}>{responseRows.length}개</div>
                {duplicateFoldedCount>0&&<div style={{height:26,padding:"0 10px",borderRadius:999,background:A.blue2,border:`1px solid ${A.blue}33`,color:A.blue,display:"flex",alignItems:"center",fontSize:12,fontWeight:600}}>중복 {duplicateFoldedCount}개 접힘</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button onClick={()=>exportAnalyticsCsv(selectedResponseRows,"selected-responses")} disabled={selectedResponseRows.length===0}
                  style={{height:38,padding:"0 12px",borderRadius:A.r,border:`1px solid ${selectedResponseRows.length?A.blue+"55":A.border}`,background:selectedResponseRows.length?A.blue2:A.card2,color:selectedResponseRows.length?A.blue:A.t3,fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:selectedResponseRows.length?"pointer":"not-allowed",display:"inline-flex",alignItems:"center",gap:6}}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v7M5 6l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  선택 다운로드 {selectedResponseRows.length>0&&`${selectedResponseRows.length}개`}
                </button>
                <button onClick={()=>deleteSelectedAnalyticsRows(selectedResponseRows)} disabled={!canDeleteSelectedResponses}
                  style={{height:38,padding:"0 12px",borderRadius:A.r,border:`1px solid ${canDeleteSelectedResponses?A.red+"55":A.border}`,background:canDeleteSelectedResponses?`${A.red}14`:A.card2,color:canDeleteSelectedResponses?A.red:A.t3,fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:canDeleteSelectedResponses?"pointer":"not-allowed",display:"inline-flex",alignItems:"center",gap:6}}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M6 4V2.8h4V4M5 6v6M8 6v6M11 6v6M4 4l.6 10h6.8L12 4" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {analyticsSelectedDeleteBusy?"삭제 중...":`선택 삭제 ${selectedResponseRows.length>0?`${selectedResponseRows.length}개`:""}`}
                </button>
                <div style={{display:"flex",gap:4,padding:4,borderRadius:A.r,background:A.card2,border:`1px solid ${A.border}`}}>
                {([{id:"submitted",label:`제출 완료 ${rows.length}`},{id:"draft",label:`작성 중 ${draftResponseRows.length}`} ] as const).map(item=>{const active=analyticsResponseScope===item.id;return <button key={item.id} onClick={()=>setAnalyticsResponseScope(item.id)}
                  style={{height:30,padding:"0 12px",borderRadius:A.r,border:"none",background:active?A.card:"transparent",color:active?A.blue:A.t2,boxShadow:active?A.shadow:"none",fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>
                  {item.label}
                </button>})}
                </div>
              </div>
            </div>
            {analyticsResponseScope==="draft"&&<div style={{fontSize:12.5,color:A.t3,lineHeight:1.6,margin:"-5px 0 14px"}}>작성 중 데이터는 제출 완료 전 자동 저장된 임시 기록입니다. 파일 첨부 내용은 브라우저 보안상 제출 전에는 저장되지 않습니다.</div>}
            {analyticsResponseScope==="submitted"&&duplicateFoldedCount>0&&<div style={{fontSize:12.5,color:A.t3,lineHeight:1.6,margin:"-5px 0 14px"}}>로그인 없이 제출된 응답 중 이름·전화번호·이메일이 모두 같은 응답은 대표 1개로 묶었어요. `중복` 버튼을 누르면 같은 사람이 더 제출한 응답을 펼쳐볼 수 있습니다.</div>}
            {responseRows.length===0?emptyState(analyticsResponseScope==="draft"?"아직 작성 중인 응답이 없습니다.":"아직 제출 완료된 응답이 없습니다."):<div className="catchform-analytics-table-scroll" style={{flex:1,minHeight:0,background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,overflow:"auto",boxShadow:A.shadow}}>
              <table style={{borderCollapse:"collapse",minWidth:analyticsTableMinWidth,width:"100%",fontSize:12.5,tableLayout:"fixed" as const}}>
                <thead><tr><th style={{position:"sticky" as const,top:0,zIndex:4,width:analyticsControlColumnWidth,minWidth:analyticsControlColumnWidth,padding:"13px 10px",textAlign:"center" as const,borderBottom:`1px solid ${A.border}`,color:A.t3,background:A.card2,fontSize:11.5,fontWeight:600}}><label style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,cursor:"pointer"}}><input type="checkbox" checked={allResponseRowsSelected} onChange={toggleAllResponseRows} style={{width:15,height:15,accentColor:A.blue,cursor:"pointer"}}/>전체</label></th><th style={{position:"sticky" as const,top:0,zIndex:4,width:analyticsDateColumnWidth,minWidth:analyticsDateColumnWidth,padding:"13px 16px",textAlign:"left",borderBottom:`1px solid ${A.border}`,borderLeft:`1px solid ${A.border}`,color:A.t3,background:A.card2,fontSize:11.5,fontWeight:600}}>날짜</th>{analyticsColumnMeta.map(({field:f,fileCount,resizable,width:colWidth}:any)=>{return <th key={f.id} style={{position:"sticky" as const,top:0,zIndex:4,padding:"13px 16px",textAlign:"left",borderBottom:`1px solid ${A.border}`,borderLeft:`1px solid ${A.border}`,color:A.t3,width:colWidth,minWidth:colWidth,maxWidth:colWidth,background:A.card2,fontSize:11.5,fontWeight:600}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                    <span style={{minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{f.label}</span>
                    {fileCount>0&&<button onClick={()=>downloadAnalyticsFilesZip(f,responseRows)} title={`첨부파일 ${fileCount}개 일괄 다운로드`} style={{height:28,padding:"0 9px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card,color:A.blue,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:5,flexShrink:0,fontFamily:FONT,fontSize:11.5,fontWeight:600,whiteSpace:"nowrap" as const}}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v7M5 6l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      모두 다운로드
                    </button>}
                    {resizable&&<span onMouseDown={e=>startAnalyticsColumnResize(e,f,colWidth)} title="드래그해서 너비 조절" style={{position:"absolute" as const,top:0,right:-3,width:8,height:"100%",cursor:"col-resize",display:"flex",alignItems:"stretch",justifyContent:"center",zIndex:6}}>
                      <span style={{width:2,margin:"10px 0",borderRadius:999,background:A.border2}}/>
                    </span>}
                  </div>
                </th>})}</tr></thead>
                <tbody>{responseRowGroups.map((group:any)=>{
                  const primary=group.rows[0]
                  const duplicateRows=group.rows.slice(1)
                  const isOpen=!!group.duplicateKey&&expandedDuplicateResponseGroups.includes(group.duplicateKey)
                  const renderResponseRow=(row:any,opts:any={})=>{
                    const dt=fmtAnalyticsDate(row.created_at)
                    const rowKey=analyticsRowKey(row)
                    const selected=selectedAnalyticsRowIds.includes(rowKey)
                    const duplicateChild=!!opts.duplicateChild
                    const duplicateCount=Number(opts.duplicateCount||0)
                    const rowBg=selected?A.blue2:duplicateChild?A.card2:"transparent"
                    return <tr key={opts.key||rowKey} style={{background:rowBg,verticalAlign:"top" as const}}>
                      <td style={{width:analyticsControlColumnWidth,minWidth:analyticsControlColumnWidth,padding:"13px 10px",borderBottom:`1px solid ${A.border}`,textAlign:"center" as const}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,flexWrap:"wrap" as const}}>
                          <input type="checkbox" checked={selected} onChange={()=>toggleResponseRow(rowKey)} aria-label="응답 선택" style={{width:15,height:15,accentColor:A.blue,cursor:"pointer",flexShrink:0}}/>
                          {!row.__draft&&<button onClick={()=>openEditAnalyticsRow(row)} title="응답 수정" style={{width:28,height:28,borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.blue,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 11.5V13h1.5L12 5.5 10.5 4 3 11.5zM9.8 4.7l1.5 1.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
                          {duplicateCount>0&&<button onClick={()=>toggleDuplicateResponseGroup(group.duplicateKey)} title="중복 응답 펼치기" style={{height:26,padding:"0 8px",borderRadius:999,border:`1px solid ${A.blue}44`,background:isOpen?A.blue:A.blue2,color:isOpen?"#fff":A.blue,fontFamily:FONT,fontSize:11.5,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}}>
                            중복 {duplicateCount+1}
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" style={{transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform .15s ease"}}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>}
                          {duplicateChild&&<span style={{height:22,padding:"0 7px",borderRadius:999,background:A.card,border:`1px solid ${A.border}`,color:A.t3,fontSize:11,fontWeight:700}}>중복 {opts.duplicateIndex}/{opts.duplicateTotal}</span>}
                        </div>
                      </td>
                      <td style={{width:analyticsDateColumnWidth,minWidth:analyticsDateColumnWidth,padding:"13px 16px",borderBottom:`1px solid ${A.border}`,borderLeft:`1px solid ${A.border}`,color:A.t1}}>
                        <div style={{whiteSpace:"nowrap" as const,fontSize:12.5,fontWeight:400,color:A.t3}}>{dt[0]}</div>
                        <div style={{fontSize:12,color:A.t3,marginTop:4,whiteSpace:"nowrap" as const}}>{dt[1]}</div>
                        {row.__draft&&<div style={{display:"inline-flex",alignItems:"center",height:20,padding:"0 7px",borderRadius:999,background:chartOrange+"16",color:chartOrange,fontSize:11,fontWeight:600,marginTop:7}}>작성 중 · 섹션 {row.__page}</div>}
                      </td>
                      {analyticsColumnMeta.map(({field:f,width:colWidth,resizable}:any)=>{
                        const isLongText=f.type==="textarea"
                        return <td key={f.id} style={{padding:"13px 16px",borderBottom:`1px solid ${A.border}`,borderLeft:`1px solid ${A.border}`,color:A.t1,verticalAlign:"top" as const,width:colWidth,minWidth:colWidth,maxWidth:colWidth}}><div style={{padding:"8px 10px",border:`1px solid ${A.border}`,borderRadius:A.r,background:duplicateChild?A.card:A.card2,color:A.t1,fontWeight:400,width:"100%",maxWidth:resizable?Math.max(260,colWidth-32):360,minWidth:0,maxHeight:isLongText?180:undefined,overflowY:isLongText?"auto" as const:"visible" as const,boxSizing:"border-box" as const,whiteSpace:"normal" as const,wordBreak:"break-word" as const,overflowWrap:"anywhere" as const}}>{renderAnalyticsAnswer(row,f)}</div></td>
                      })}
                    </tr>
                  }
                  return <React.Fragment key={group.key}>
                    {renderResponseRow(primary,{duplicateCount:duplicateRows.length,key:`${group.key}:primary`})}
                    {isOpen&&duplicateRows.map((row:any,idx:number)=>renderResponseRow(row,{duplicateChild:true,duplicateIndex:idx+2,duplicateTotal:group.rows.length,key:`${group.key}:duplicate:${analyticsRowKey(row)}`}))}
                  </React.Fragment>
                })}</tbody>
              </table>
            </div>}
          </div>}
          {activeAnalyticsTab==="questions"&&<div>
            <div style={{fontSize:18,fontWeight:700,color:A.t1,letterSpacing:"-.2px",marginBottom:16}}>질문별 인사이트</div>
            <div style={{display:"grid",gridTemplateColumns:width<980?"1fr":"320px minmax(0,1fr)",gap:16,alignItems:"start"}}>
              <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,boxShadow:A.shadow,overflow:"hidden"}}>
                <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${A.border}`,background:A.card2}}>
                  <div style={{fontSize:11,fontWeight:700,color:A.t3,letterSpacing:"0.6px",marginBottom:4}}>섹션 / 질문</div>
                  <div style={{fontSize:13,fontWeight:600,color:A.t1}}>섹션을 열어 질문을 선택하세요</div>
                </div>
                <div style={{padding:10,display:"flex",flexDirection:"column" as const,gap:8,maxHeight:620,overflow:"auto"}}>
                  {analyticsPages.map(p=>{const open=selectedAnalyticsPage===p;const pageFields=fieldsByPage[p]||[];const first=pageFields[0];const pageVisible=open?visibleSectionQuestionFields:pageFields;const questionListScroll=open&&pageVisible.length>7;return <div key={p} style={{border:`1px solid ${open?A.blue+"55":A.border}`,borderRadius:A.r,background:open?A.blue2:A.card2,overflow:"hidden"}}>
                    <button onClick={()=>{setAnalyticsSection(p);setAnalyticsQuestionQuery("");if(first)setAnalyticsQuestionId(first.id);setAnalyticsHoverSlice(null)}} style={{width:"100%",minHeight:44,padding:"9px 10px",border:"none",background:"transparent",color:open?A.blue:A.t1,fontFamily:FONT,cursor:"pointer",display:"flex",alignItems:"center",gap:9,textAlign:"left" as const}}>
                      <span style={{width:4,alignSelf:"stretch",borderRadius:999,background:open?A.blue:A.border,flexShrink:0}}/>
                      <span style={{flex:1,minWidth:0,fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{pageName(p)}</span>
                      <span style={{height:22,minWidth:26,padding:"0 7px",borderRadius:999,background:open?A.blue:A.card,border:`1px solid ${open?A.blue:A.border}`,color:open?"#fff":A.t3,fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center"}}>{pageFields.length}</span>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{transform:open?"rotate(180deg)":"rotate(0deg)",transition:"transform .16s ease",color:open?A.blue:A.t3,flexShrink:0}}><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    {open&&<div style={{padding:"0 10px 10px"}}>
                      {pageFields.length>8&&<div style={{position:"relative" as const,margin:"2px 0 8px"}}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{position:"absolute",left:10,top:9,color:A.t3}}><circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                        <input value={analyticsQuestionQuery} onChange={e=>setAnalyticsQuestionQuery(e.target.value)} placeholder="질문 검색"
                          style={{width:"100%",height:31,borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card,color:A.t1,fontFamily:FONT,fontSize:12,fontWeight:600,padding:"0 10px 0 30px",outline:"none",boxSizing:"border-box" as const}}/>
                      </div>}
                      {pageFields.length===0
                        ? <div style={{height:54,borderRadius:A.r,border:`1px dashed ${A.border2}`,display:"flex",alignItems:"center",justifyContent:"center",color:A.t3,fontSize:12.5}}>질문이 없습니다.</div>
                        : pageVisible.length===0
                        ? <div style={{height:54,borderRadius:A.r,border:`1px dashed ${A.border2}`,display:"flex",alignItems:"center",justifyContent:"center",color:A.t3,fontSize:12.5}}>검색 결과가 없습니다.</div>
                        : <div style={{display:"flex",flexDirection:"column" as const,gap:6,maxHeight:questionListScroll?386:undefined,overflowY:questionListScroll?"auto" as const:"visible" as const,paddingRight:questionListScroll?4:0,paddingBottom:questionListScroll?4:0}}>
                          {pageVisible.map((f:any)=>{const on=activeField?.id===f.id;const originalIdx=pageFields.findIndex((sf:any)=>sf.id===f.id);return <button key={f.id} onClick={()=>{setAnalyticsQuestionId(f.id);setAnalyticsHoverSlice(null)}} style={{minHeight:42,padding:"7px 8px",borderRadius:A.r,border:`1px solid ${on?A.blue+"66":A.border}`,background:on?A.card:A.card2,color:on?A.blue:A.t1,fontFamily:FONT,cursor:"pointer",textAlign:"left" as const,display:"flex",alignItems:"center",gap:9,transition:"all .14s ease",boxShadow:on?`0 0 0 3px ${A.blue}14`:"none"}}>
                            <span style={{width:24,height:24,borderRadius:8,background:on?A.blue:A.card,border:`1px solid ${on?A.blue:A.border}`,color:on?"#fff":A.t3,fontSize:11.5,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{originalIdx+1}</span>
                            <span style={{minWidth:0,flex:1}}>
                              <span style={{display:"block",fontSize:12.5,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.label}</span>
                              <span style={{display:"block",fontSize:11,color:on?A.blue:A.t3,marginTop:4,fontWeight:600}}>{fieldTypeName(f.type)}{f.required?" · 필수":""}</span>
                            </span>
                          </button>})}
                        </div>}
                    </div>}
                  </div>})}
                </div>
              </div>
            {!activeField?emptyState("분석할 질문이 없습니다."):<div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:24,minHeight:620,boxShadow:A.shadow}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:22}}>
                <div style={{fontSize:18,fontWeight:700,color:A.t1,letterSpacing:"-.2px",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{activeField.label}</div>
                {activeFileCount>0&&<button onClick={()=>downloadAnalyticsFilesZip(activeField,rows)} style={{height:34,padding:"0 12px",borderRadius:A.r,border:`1px solid ${A.blue}33`,background:A.blue2,color:A.blue,fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v7M5 6l3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  첨부파일 {activeFileCount}개 다운로드
                </button>}
              </div>
              {isListQuestion
                ? <div>{directAnswerRows.length===0?emptyState("표시할 응답이 없습니다."):<div style={{display:"flex",flexDirection:"column" as const,gap:8}}>{directAnswerRows.map((item:any,idx:number)=><div key={item.row.id||idx} style={{display:"grid",gridTemplateColumns:"140px 1fr",gap:14,alignItems:"start",padding:"12px 14px",border:`1px solid ${A.border}`,borderRadius:A.r,background:A.card2}}>
                    <div style={{fontSize:12,color:A.t3,lineHeight:1.5}}><div>{item.date[0]}</div><div>{item.date[1]}</div></div>
                    <div style={{fontSize:13.5,color:A.t1,lineHeight:1.65,whiteSpace:"pre-wrap" as const,wordBreak:"break-word" as const}}>{analyticsFileItems(item.raw).length?analyticsFileItems(item.raw).map((f:any,i:number)=>f.url?<button key={i} onClick={()=>setFilePreview(f)} style={{display:"block",border:"none",background:"transparent",padding:0,color:A.blue,textDecoration:"none",fontWeight:600,fontFamily:FONT,fontSize:13.5,cursor:"pointer",textAlign:"left" as const}}>{f.name}</button>:<span key={i} style={{display:"block"}}>{f.name}</span>):analyticsAnswer(item.row,activeField)}</div>
                  </div>)}</div>}</div>
                : <div style={{display:"grid",gridTemplateColumns:"minmax(280px,420px) 1fr",gap:34,alignItems:"center"}}>
                    <div style={{position:"relative" as const,width:"100%",maxWidth:420,aspectRatio:"1 / 1",margin:"0 auto"}}>
                      {pieSlices.length===0?<div style={{position:"absolute" as const,inset:0,borderRadius:"50%",background:A.card2,border:`1px solid ${A.border}`}}/>:<svg viewBox="0 0 320 320" style={{width:"100%",height:"100%",overflow:"visible"}}>
                        {pieSlices.map((s:any,i:number)=>s.end-s.start>=359.99
                          ? <circle key={s.label} cx="160" cy="160" r="128" fill={s.color} onMouseMove={e=>movePieTip(i,e)} onMouseEnter={e=>movePieTip(i,e)} onMouseLeave={()=>{setAnalyticsHoverSlice(null);setAnalyticsHoverPoint(null)}} style={{cursor:"pointer",transform:analyticsHoverSlice===i?"scale(1.04)":"scale(1)",transformOrigin:"160px 160px",transition:"transform .16s ease"}}/>
                          : <path key={s.label} d={piePath(160,160,128,s.start,s.end)} fill={s.color} stroke={A.card} strokeWidth="2" onMouseMove={e=>movePieTip(i,e)} onMouseEnter={e=>movePieTip(i,e)} onMouseLeave={()=>{setAnalyticsHoverSlice(null);setAnalyticsHoverPoint(null)}} style={{cursor:"pointer",transform:analyticsHoverSlice===i?"scale(1.045)":"scale(1)",transformOrigin:"160px 160px",transition:"transform .16s ease"}}/>
                        )}
                      </svg>}
                      {analyticsHoverSlice!==null&&pieSlices[analyticsHoverSlice]&&<div style={{position:"absolute" as const,left:(analyticsHoverPoint?.x??210)+14,top:(analyticsHoverPoint?.y??170)+14,background:A.card,border:`1px solid ${pieSlices[analyticsHoverSlice].color}`,borderRadius:A.r,padding:"12px 14px",boxShadow:A.shadow,minWidth:190,pointerEvents:"none" as const,zIndex:5}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:14,fontWeight:600,color:A.t1,marginBottom:6}}><span style={{width:10,height:10,borderRadius:"50%",background:pieSlices[analyticsHoverSlice].color,flexShrink:0}}/>{pieSlices[analyticsHoverSlice].label}</div>
                        <div style={{fontSize:13,color:A.t2}}>카운트 : <b style={{color:A.t1}}>{pieSlices[analyticsHoverSlice].count}</b> ({pieSlices[analyticsHoverSlice].pct}%)</div>
                      </div>}
                    </div>
                    <div>{countEntries.length===0?emptyState("표시할 응답이 없습니다."):countEntries.map((item:any,i)=>{const k=item[0],v=item[1];const pct=totalCount?Math.round((v/totalCount)*1000)/10:0;return <div key={k} onMouseEnter={()=>setAnalyticsHoverSlice(i)} onMouseLeave={()=>{setAnalyticsHoverSlice(null);setAnalyticsHoverPoint(null)}} style={{display:"grid",gridTemplateColumns:"18px 1fr auto",gap:10,alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${A.border}`,cursor:"default"}}><span style={{width:14,height:14,borderRadius:4,background:colors[i%colors.length]}}/><span style={{fontSize:13.5,color:A.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{k}</span><span style={{fontSize:13,fontWeight:600,color:A.t1}}>{v} · {pct}%</span></div>})}</div>
                    {choiceDirectRows.length>0&&<div style={{gridColumn:"1 / -1",marginTop:4,borderTop:`1px solid ${A.border}`,paddingTop:18}}>
                      <div style={{fontSize:13,fontWeight:600,color:A.t1,marginBottom:10}}>직접 입력 응답</div>
                      <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>{choiceDirectRows.map((item:any,idx:number)=><div key={item.row.id||idx} style={{display:"grid",gridTemplateColumns:"140px 1fr",gap:14,alignItems:"start",padding:"10px 12px",borderRadius:A.r,background:A.card2,border:`1px solid ${A.border}`}}>
                        <div style={{fontSize:12,color:A.t3,lineHeight:1.5}}><div>{item.date[0]}</div><div>{item.date[1]}</div></div>
                        <div style={{fontSize:13.5,color:A.t1,lineHeight:1.6,whiteSpace:"pre-wrap" as const,wordBreak:"break-word" as const}}>{item.answers.join(" / ")}</div>
                      </div>)}</div>
                    </div>}
                  </div>}
            </div>}
            </div>
          </div>}
          {activeAnalyticsTab==="period"&&<div>
            <div style={{fontSize:18,fontWeight:700,color:A.t1,letterSpacing:"-.2px",marginBottom:16}}>기간별 인사이트</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,marginBottom:16}}>
	              {metric(<path d="M5 3l7 5-7 5V3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>,String(sessionCount),"참여",chartBlue)}
	              {metric(<path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,`${completionRate}%`,"완료율",chartGreen)}
	              {metric(<><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></>,avgTime,"평균 세션시간",chartYellow)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"minmax(340px,1fr) minmax(320px,1fr)",gap:16,marginBottom:16}}>
              <div data-period-card style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:18,boxShadow:A.shadow,position:"relative" as const}}>
                {infoTitle("유입경로","form_response_events의 started/page 이벤트 metadata에 저장된 source, utm_source, referrer_host를 기준으로 채널을 묶습니다. 출처 미확인은 referrer와 UTM 정보가 모두 비어 있어 원천을 확인할 수 없는 방문입니다.")}
                {periodTip("source")}
                {sourceEntries.length===0?emptyState("유입경로 데이터가 아직 없습니다."):<div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:18,alignItems:"center"}}>
	                  <svg viewBox="0 0 260 260" style={{width:"100%",maxWidth:280,overflow:"visible"}}>
	                    <circle cx="130" cy="130" r="86" fill="none" stroke={A.card2} strokeWidth="42"/>
	                    {donutSlices.map((s:any,i:number)=>s.end-s.start>=359.99
	                      ? <circle key={s.label} cx="130" cy="130" r="86" fill="none" stroke={s.color} strokeWidth="42" onMouseMove={e=>movePeriodTip("source",e,{title:s.label,color:s.color,lines:[`참여 : ${s.participation} (${s.pct}%)`,`완료 : ${s.complete}`,`전환율 : ${s.conversion}%`,`공유 : ${s.share} · 링크 클릭 : ${s.link}`]})} onMouseLeave={()=>setPeriodHover(null)} style={{cursor:"pointer",transform:periodHover?.scope==="source"&&periodHover.title===s.label?"scale(1.035)":"scale(1)",transformOrigin:"130px 130px",transition:"transform .16s ease"}}/>
	                      : <path key={s.label} d={donutPath(130,130,86,s.start+donutGap(s),s.end-donutGap(s))} fill="none" stroke={s.color} strokeWidth="42" strokeLinecap="round" onMouseMove={e=>movePeriodTip("source",e,{title:s.label,color:s.color,lines:[`참여 : ${s.participation} (${s.pct}%)`,`완료 : ${s.complete}`,`전환율 : ${s.conversion}%`,`공유 : ${s.share} · 링크 클릭 : ${s.link}`]})} onMouseLeave={()=>setPeriodHover(null)} style={{cursor:"pointer",transform:periodHover?.scope==="source"&&periodHover.title===s.label?"scale(1.035)":"scale(1)",transformOrigin:"130px 130px",transition:"transform .16s ease"}}/>
	                    )}
	                  </svg>
                  <div>
                    {sourceEntries.map((s:any,i:number)=><div key={s.label} style={{display:"grid",gridTemplateColumns:"14px 1fr auto",gap:9,alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${A.border}`}}>
                      <span style={{width:12,height:12,borderRadius:4,background:colors[i%colors.length]}}/>
                      <span style={{fontSize:13,color:A.t1,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{s.label}</span>
                      <span style={{fontSize:12.5,color:A.t2,fontWeight:600}}>참여 {s.participation} · 완료 {s.complete} · 전환 {s.conversion}%</span>
                    </div>)}
                    {sourceEntries.some((s:any)=>s.label===UNKNOWN_SOURCE_LABEL)&&<div style={{marginTop:10,padding:"10px 12px",borderRadius:A.r,background:A.card2,border:`1px solid ${A.border}`,fontSize:12,lineHeight:1.55,color:A.t2}}>
                      출처 미확인은 URL 직접 입력뿐 아니라 카카오톡·문자·메일 앱, 새 탭/즐겨찾기, 브라우저 개인정보 보호 설정처럼 referrer가 전달되지 않는 방문입니다. 링크에 <b style={{color:A.t1}}>utm_source</b>를 붙이면 채널별로 분리해서 볼 수 있어요.
                    </div>}
                  </div>
                </div>}
              </div>
              <div data-period-card style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:18,boxShadow:A.shadow,position:"relative" as const}}>
	                {infoTitle("위치","제출자가 입력한 현 거주지, 주소, 지역 답변은 사용하지 않습니다. 폼 진입 시 form_response_events metadata에 저장된 접속 위치만 사용합니다. QR 진입은 사용자가 브라우저 위치 권한을 허용하면 좌표를 기준으로 시·구·동을 확인하고, 허용하지 않으면 IP 기반 추정 위치를 사용합니다.")}
	                {periodTip("location")}
	                {locationTotal===0?emptyState("위치 데이터가 아직 없습니다."):<div style={{display:"flex",flexDirection:"column" as const,gap:11}}>
	                  <div style={{height:28,padding:"0 10px",borderRadius:999,background:A.blue2,border:`1px solid ${A.blue}33`,color:A.blue,fontSize:11.5,fontWeight:600,display:"inline-flex",alignItems:"center",alignSelf:"flex-start"}}>
	                    기준: {locationSource}
	                  </div>
	                  {locationEntries.slice(0,12).map((item:any,i:number)=>{
	                    const label=String(item[0]||"미확인")
	                    const count=Number(item[1])||0
	                    const max=Math.max(1,Number(locationEntries[0]?.[1])||1)
	                    const pct=locationTotal?Math.round((count/locationTotal)*1000)/10:0
	                    const color=colors[i%colors.length]
	                    return <div key={label} onMouseMove={e=>movePeriodTip("location",e,{title:label,color,lines:[`카운트 : ${count}`,`전체 위치 데이터 대비 : ${pct}%`]})} onMouseLeave={()=>setPeriodHover(null)} style={{display:"grid",gridTemplateColumns:"minmax(120px,190px) 1fr 58px",gap:12,alignItems:"center",cursor:"default"}}>
	                      <div style={{fontSize:13,color:A.t1,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{label}</div>
	                      <div style={{height:12,borderRadius:999,background:A.card2,overflow:"hidden"}}>
	                        <div style={{height:"100%",width:`${(count/max)*100}%`,borderRadius:999,background:color,transform:periodHover?.scope==="location"&&periodHover.title===label?"scaleY(1.22)":"scaleY(1)",transformOrigin:"center",transition:"transform .16s ease"}}/>
	                      </div>
	                      <div style={{fontSize:12.5,color:A.t2,textAlign:"right" as const,fontWeight:600}}>{count}</div>
	                    </div>
	                  })}
	                  <div style={{marginTop:4,padding:"10px 12px",borderRadius:A.r,background:A.card2,border:`1px solid ${A.border}`,fontSize:12.5,lineHeight:1.55,color:A.t2}}>
	                    위치 분석은 제출 답변이 아니라 실제 접속 metadata만 사용합니다. QR 진입 시 위치 권한을 허용하면 좌표 기반 지역을 표시하고, 권한을 거부하거나 브라우저에서 좌표를 확인하지 못하면 통신망/IP 위치가 표시되어 실제 위치와 다르거나 `미확인`으로 남을 수 있습니다.
	                  </div>
	                </div>}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"minmax(340px,1fr) minmax(340px,1fr)",gap:16,marginBottom:16}}>
              <div data-period-card style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:18,boxShadow:A.shadow,position:"relative" as const}}>
                {infoTitle("공유","폼의 공유 버튼 클릭을 share 이벤트로 저장합니다. 파란 막대는 전체 공유 클릭 수, 회색 막대는 같은 사용자가 여러 번 누른 것을 1명으로 묶은 중복 제외 사용자 수입니다.")}
                {periodTip("share")}
                {shareEntries.length===0?emptyState("공유 이벤트가 아직 없습니다. 링크/공유 버튼 클릭 데이터가 쌓이면 표시됩니다."):<div style={{display:"flex",flexDirection:"column" as const,gap:12}}>
	                  {shareEntries.slice(0,8).map((s:any)=>{const max=Math.max(1,shareEntries[0]?.total||1);return <div key={s.channel} onMouseMove={e=>movePeriodTip("share",e,{title:s.channel,color:chartBlue,lines:[`전체 공유 클릭 : ${s.total}`,`중복 제외 사용자 : ${s.unique}`]})} onMouseLeave={()=>setPeriodHover(null)} style={{display:"grid",gridTemplateColumns:"90px 1fr 88px",gap:12,alignItems:"center",cursor:"default"}}>
                    <div style={{fontSize:13,color:A.t1,fontWeight:600}}>{s.channel}</div>
                    <div style={{display:"flex",flexDirection:"column" as const,gap:5}}>
	                      <div style={{height:10,borderRadius:999,background:A.card2,overflow:"hidden"}}><div style={{height:"100%",width:`${(s.total/max)*100}%`,background:chartBlue,transform:periodHover?.scope==="share"&&periodHover.title===s.channel?"scaleY(1.35)":"scaleY(1)",transformOrigin:"center",transition:"transform .16s ease"}}/></div>
	                      <div style={{height:10,borderRadius:999,background:A.card2,overflow:"hidden"}}><div style={{height:"100%",width:`${(s.unique/max)*100}%`,background:chartSlate}}/></div>
                    </div>
                    <div style={{fontSize:11.5,color:A.t2,textAlign:"right" as const,fontWeight:600,lineHeight:1.35}}>공유 {s.total}<br/>중복 제외 {s.unique}</div>
                  </div>})}
                </div>}
              </div>
              <div data-period-card style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:18,boxShadow:A.shadow,position:"relative" as const}}>
                {infoTitle("활동","form_response_events의 날짜별 이벤트를 기준으로 참여, 완료, 공유, 링크 클릭 추이를 표시합니다. 최근 날짜 중심으로 사용자의 이동과 반응이 어느 날에 몰렸는지 볼 수 있습니다.")}
                {periodTip("activity")}
                {activityEntries.length===0?emptyState("활동 데이터가 아직 없습니다."):<div style={{height:260,display:"flex",alignItems:"flex-end",gap:12,borderLeft:`1px solid ${A.border}`,borderBottom:`1px solid ${A.border}`,padding:"12px 8px 26px",position:"relative" as const}}>
                  {activityEntries.map((d:any)=><div key={d.date} style={{flex:1,height:"100%",display:"flex",alignItems:"flex-end",gap:3,position:"relative" as const}}>
	                    {[["participation",chartBlue,"참여"],["complete",chartGreen,"완료"],["share",chartPurple,"공유"],["link",chartSlate,"링크 클릭"]].map((pair:any)=><div key={pair[0]} onMouseMove={e=>movePeriodTip("activity",e,{title:`${d.date} ${pair[2]}`,color:pair[1],lines:[`${pair[2]} : ${d[pair[0]]}`,`날짜 : ${d.date}`]})} onMouseLeave={()=>setPeriodHover(null)} style={{flex:1,height:`${Math.max(2,(d[pair[0]]/maxActivity)*100)}%`,borderRadius:"6px 6px 0 0",background:pair[1],cursor:"pointer",transform:periodHover?.scope==="activity"&&periodHover.title===`${d.date} ${pair[2]}`?"scaleY(1.06)":"scaleY(1)",transformOrigin:"bottom",transition:"transform .16s ease"}}/>)}
                    <div style={{position:"absolute" as const,left:"50%",bottom:-22,transform:"translateX(-50%)",fontSize:10.5,color:A.t3,whiteSpace:"nowrap" as const}}>{String(d.date).slice(5)}</div>
                  </div>)}
                </div>}
              </div>
            </div>
	            {periodRows.length===0?emptyState("기간별로 표시할 응답이 없습니다."):<div data-period-card style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:18,boxShadow:A.shadow,position:"relative" as const}}>
	              {infoTitle("일자별 응답 수","applications 또는 company_applications 응답 row의 created_at을 기준으로 실제 제출 완료 응답 수를 날짜별로 집계합니다. 막대 길이는 전체 응답 대비 해당 날짜의 비중입니다.")}
	              {periodTip("period")}
	              <div style={{height:250,display:"flex",alignItems:"flex-end",gap:10,borderLeft:`1px solid ${A.border}`,borderBottom:`1px solid ${A.border}`,padding:"18px 10px 28px",position:"relative" as const}}>
	                {periodChartRows.map((item:any,i:number)=>{const d=item[0],c=Number(item[1])||0;const h=Math.max(5,(c/maxPeriodCount)*100);const color=colors[i%colors.length];return <div key={d} style={{flex:1,height:"100%",display:"flex",alignItems:"flex-end",justifyContent:"center",position:"relative" as const}}>
	                  <div onMouseMove={e=>movePeriodTip("period",e,{title:String(d),color,lines:[`응답 수 : ${c}`,`전체 대비 : ${rows.length?Math.round((c/rows.length)*1000)/10:0}%`]})} onMouseLeave={()=>setPeriodHover(null)}
	                    style={{width:"70%",maxWidth:42,height:`${h}%`,borderRadius:"8px 8px 0 0",background:color,cursor:"pointer",transform:periodHover?.scope==="period"&&periodHover.title===String(d)?"scaleY(1.05)":"scaleY(1)",transformOrigin:"bottom",transition:"transform .16s ease, opacity .16s",opacity:periodHover?.scope==="period"&&periodHover.title!==String(d)?0.55:1}}/>
	                  <div style={{position:"absolute" as const,bottom:-22,left:"50%",transform:"translateX(-50%)",fontSize:10.5,color:A.t3,whiteSpace:"nowrap" as const}}>{String(d).slice(5)}</div>
	                </div>})}
	              </div>
	            </div>}
          </div>}
          {activeAnalyticsTab==="dropoff"&&<div>
            <div style={{fontSize:18,fontWeight:700,color:A.t1,letterSpacing:"-.2px",marginBottom:16}}>질문별 이탈률</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,marginBottom:16}}>
	              {metric(<path d="M4 3.5h5v9H4M9 8h5M12 5.8 14.2 8 12 10.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>,String(dropTotal),"추정 이탈",chartPink)}
	              {metric(<path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,`${completionRate}%`,"완료율",chartGreen)}
	              {metric(<><path d="M3.5 4.5h7.2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H8L5 14v-2.5H3.5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/><path d="M8.8 7.2h4.5M11.4 5.1 13.5 7.2l-2.1 2.1" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></>,String(dropRows[0]?.question||"-"),"최다 이탈 질문",chartBlue)}
            </div>
            {dropRows.length===0?emptyState("아직 이탈 이벤트가 없습니다."):<div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,overflow:"hidden",boxShadow:A.shadow}}>
              <div style={{display:"grid",gridTemplateColumns:"150px minmax(260px,1fr) 160px 90px",gap:0,background:A.card2,borderBottom:`1px solid ${A.border}`,fontSize:12,color:A.t2,fontWeight:600}}>
                <div style={{padding:"12px 14px"}}>섹션</div><div style={{padding:"12px 14px",borderLeft:`1px solid ${A.border}`}}>질문</div><div style={{padding:"12px 14px",borderLeft:`1px solid ${A.border}`}}>전체 대비</div><div style={{padding:"12px 14px",borderLeft:`1px solid ${A.border}`,textAlign:"right" as const}}>이탈 수</div>
              </div>
              {dropRows.map((item:any)=>{const pct=sessionCount?Math.round((item.count/sessionCount)*1000)/10:0;return <div key={item.key} style={{display:"grid",gridTemplateColumns:"150px minmax(260px,1fr) 160px 90px",alignItems:"center",borderBottom:`1px solid ${A.border}`,fontSize:13}}>
                <div style={{padding:"13px 14px",color:A.t2,fontWeight:600}}>{item.section}</div>
                <div style={{padding:"13px 14px",borderLeft:`1px solid ${A.border}`,color:A.t1,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{item.question}</div>
	                <div style={{padding:"13px 14px",borderLeft:`1px solid ${A.border}`}}><div style={{height:9,borderRadius:999,background:A.card2,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:chartPink}}/></div><div style={{fontSize:11.5,color:A.t3,marginTop:5}}>{pct}%</div></div>
                <div style={{padding:"13px 14px",borderLeft:`1px solid ${A.border}`,textAlign:"right" as const,color:A.t1,fontWeight:600}}>{item.count}</div>
              </div>})}
            </div>}
          </div>}
          {activeAnalyticsTab==="qr"&&<div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" as const,marginBottom:10}}>
              <div style={{fontSize:18,fontWeight:700,color:A.t1,letterSpacing:"-.2px"}}>QR 데이터</div>
              {hasDetailQr&&<div style={{display:"flex",gap:4,padding:4,borderRadius:A.r,background:A.card2,border:`1px solid ${A.border}`}}>
                {([{id:"form",label:"폼 QR"},{id:"detail",label:"상세페이지 QR"}] as const).map(item=>{const active=activeQrScope===item.id;return <button key={item.id} onClick={()=>setQrAnalyticsScope(item.id)}
                  style={{height:30,padding:"0 12px",borderRadius:A.r,border:"none",background:active?A.card:"transparent",color:active?A.blue:A.t2,boxShadow:active?A.shadow:"none",fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>
                  {item.label}
                </button>})}
              </div>}
            </div>
            <div style={{fontSize:12.5,color:A.t3,marginBottom:16}}>
              {activeQrScope==="detail"?"상세페이지용 QR을 스캔하고 외부 페이지로 이동한 데이터를 보여줍니다.":"폼 진입용 QR을 스캔하고 폼 페이지로 들어온 데이터를 보여줍니다."}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,marginBottom:16}}>
              {metric(<><path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3z" stroke="currentColor" strokeWidth="1.4"/><path d="M10 10h3v3h-3z" fill="currentColor"/></>,String(qrScanTotal),"총 스캔",chartBlue)}
              {metric(<path d="M8 2.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM3 14c.8-2.5 2.6-3.8 5-3.8s4.2 1.3 5 3.8" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round"/>,String(qrUniqueScans),"고유 스캔",chartOrange)}
              {metric(<><path d="M2.5 8s2-4 5.5-4 5.5 4 5.5 4-2 4-5.5 4-5.5-4-5.5-4z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="1.8" fill="currentColor"/></>,String(qrVisits),qrVisitLabel,chartGreen)}
            </div>
            {qrBaseEvents.length===0?emptyState("아직 QR 스캔 데이터가 없습니다. QR 메뉴에서 다운로드한 QR을 스캔하면 이곳에 기록됩니다."):<>
              <div style={{display:"grid",gridTemplateColumns:"minmax(340px,1.2fr) minmax(300px,0.8fr)",gap:16,marginBottom:16}}>
                <div data-period-card style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:18,boxShadow:A.shadow,position:"relative" as const}}>
                  {infoTitle("스캔 활동",activeQrScope==="detail"?"상세페이지 QR 추적 링크를 날짜별로 집계합니다. 총 스캔은 전체 스캔 횟수, 고유 스캔은 같은 사용자/기기를 중복 제외한 수, 상세페이지 이동은 QR 리다이렉트 횟수입니다.":"폼 QR 추적 링크를 날짜별로 집계합니다. 총 스캔은 전체 스캔 횟수, 고유 스캔은 같은 사용자/기기를 중복 제외한 수, 폼 방문은 QR을 통해 폼 페이지까지 들어온 세션 수입니다.")}
                  {periodTip("qr-activity")}
                  <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12,fontSize:12.5,color:A.t2,fontWeight:600}}>
                    <span style={{display:"flex",alignItems:"center",gap:6}}><i style={{width:10,height:10,borderRadius:3,background:chartBlue}}/>총 스캔</span>
                    <span style={{display:"flex",alignItems:"center",gap:6}}><i style={{width:10,height:10,borderRadius:3,background:chartOrange}}/>고유 스캔</span>
                    <span style={{display:"flex",alignItems:"center",gap:6}}><i style={{width:10,height:10,borderRadius:3,background:chartGreen}}/>{qrVisitLabel}</span>
                  </div>
                  <div style={{height:270,display:"flex",alignItems:"flex-end",gap:16,borderLeft:`1px solid ${A.border}`,borderBottom:`1px solid ${A.border}`,padding:"12px 12px 28px"}}>
                    {qrActivityRows.map((d:any)=><div key={d.date} style={{flex:1,height:"100%",display:"flex",alignItems:"flex-end",gap:5,position:"relative" as const}}>
                      {([["total",chartBlue,"총 스캔"],["unique",chartOrange,"고유 스캔"],["visits",chartGreen,qrVisitLabel]] as any[]).map(pair=><div key={pair[0]} onMouseMove={e=>movePeriodTip("qr-activity",e,{title:`${d.date} ${pair[2]}`,color:pair[1],lines:[`${pair[2]} : ${d[pair[0]]}`,`날짜 : ${d.date}`]})} onMouseLeave={()=>setPeriodHover(null)}
                        style={{flex:1,height:`${Math.max(2,(d[pair[0]]/qrActivityMax)*100)}%`,borderRadius:"7px 7px 0 0",background:pair[1],cursor:"pointer",transform:periodHover?.scope==="qr-activity"&&periodHover.title===`${d.date} ${pair[2]}`?"scaleY(1.06)":"scaleY(1)",transformOrigin:"bottom",transition:"transform .16s ease"}}/>)}
                      <div style={{position:"absolute" as const,left:"50%",bottom:-22,transform:"translateX(-50%)",fontSize:10.5,color:A.t3,whiteSpace:"nowrap" as const}}>{String(d.date).slice(5)}</div>
                    </div>)}
                  </div>
                </div>
                <div data-period-card style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:18,boxShadow:A.shadow,position:"relative" as const}}>
                  {infoTitle("운영체제별 스캔","QR 스캔 시 브라우저가 보내는 user agent와 폼 페이지 metadata의 device_os를 기준으로 Android, iOS, Windows, macOS 등 운영체제를 분류합니다.")}
                  {periodTip("qr-os")}
                  {qrOsEntries.length===0?emptyState("운영체제 데이터가 없습니다."):<div style={{display:"flex",flexDirection:"column" as const,gap:11}}>
                    {qrOsEntries.slice(0,8).map((item:any,i:number)=>{const max=Math.max(1,qrOsEntries[0]?.count||1);const color=colors[i%colors.length];return <div key={item.label} onMouseMove={e=>movePeriodTip("qr-os",e,{title:item.label,color,lines:[`스캔 : ${item.count}`,`비율 : ${item.pct}%`]})} onMouseLeave={()=>setPeriodHover(null)} style={{display:"grid",gridTemplateColumns:"88px 1fr 54px",gap:10,alignItems:"center",cursor:"default"}}>
                      <div style={{fontSize:13,color:A.t1,fontWeight:600}}>{item.label}</div>
                      <div style={{height:10,borderRadius:999,background:A.card2,overflow:"hidden"}}><div style={{height:"100%",width:`${(item.count/max)*100}%`,background:color}}/></div>
                      <div style={{fontSize:12.5,color:A.t2,textAlign:"right" as const,fontWeight:600}}>{item.count}</div>
                    </div>})}
                  </div>}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"minmax(340px,1fr) minmax(340px,1fr)",gap:16,marginBottom:16}}>
                <div data-period-card style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:18,boxShadow:A.shadow,position:"relative" as const}}>
                  {infoTitle("국가별 분석","QR 스캔 시 수집되는 국가 header와 폼 페이지 metadata의 country 값을 기준으로 어느 국가에서 스캔이 발생했는지 보여줍니다.")}
                  {periodTip("qr-country")}
                  {qrCountryEntries.length===0?emptyState("국가 데이터가 없습니다."):<div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
                    {qrCountryEntries.slice(0,10).map((item:any,i:number)=>{const max=Math.max(1,qrCountryEntries[0]?.count||1);const color=colors[i%colors.length];return <div key={item.label} onMouseMove={e=>movePeriodTip("qr-country",e,{title:item.label,color,lines:[`스캔 : ${item.count}`,`비율 : ${item.pct}%`]})} onMouseLeave={()=>setPeriodHover(null)} style={{display:"grid",gridTemplateColumns:"120px 1fr 62px",gap:10,alignItems:"center",cursor:"default"}}>
                      <div style={{fontSize:13,color:A.t1,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{item.label}</div>
                      <div style={{height:10,borderRadius:999,background:A.card2,overflow:"hidden"}}><div style={{height:"100%",width:`${(item.count/max)*100}%`,background:color}}/></div>
                      <div style={{fontSize:12.5,color:A.t2,textAlign:"right" as const,fontWeight:600}}>{item.count} · {item.pct}%</div>
                    </div>})}
                  </div>}
                </div>
                <div data-period-card style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:18,boxShadow:A.shadow,position:"relative" as const}}>
                  {infoTitle("도시/지역별 분석","QR 스캔 시 브라우저 위치 권한이 허용되면 좌표를 기준으로 확인한 시·구·동 metadata를 우선 사용합니다. 권한이 없으면 IP 기반 country, region, city 추정값을 사용합니다.")}
                  {periodTip("qr-city")}
                  {qrCityEntries.length===0?emptyState("도시/지역 데이터가 없습니다."):<div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
                    {qrCityEntries.slice(0,10).map((item:any,i:number)=>{const max=Math.max(1,qrCityEntries[0]?.count||1);const color=colors[(i+2)%colors.length];return <div key={item.label} onMouseMove={e=>movePeriodTip("qr-city",e,{title:item.label,color,lines:[`스캔 : ${item.count}`,`비율 : ${item.pct}%`]})} onMouseLeave={()=>setPeriodHover(null)} style={{display:"grid",gridTemplateColumns:"120px 1fr 62px",gap:10,alignItems:"center",cursor:"default"}}>
                      <div style={{fontSize:13,color:A.t1,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{item.label}</div>
                      <div style={{height:10,borderRadius:999,background:A.card2,overflow:"hidden"}}><div style={{height:"100%",width:`${(item.count/max)*100}%`,background:color}}/></div>
                      <div style={{fontSize:12.5,color:A.t2,textAlign:"right" as const,fontWeight:600}}>{item.count} · {item.pct}%</div>
                    </div>})}
                  </div>}
                </div>
              </div>
              <div data-period-card style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:18,boxShadow:A.shadow,position:"relative" as const}}>
                {infoTitle("스캔 시간대 분석","QR 스캔 이벤트의 created_at을 요일과 시간대로 나눠 보여줍니다. 진한 칸일수록 해당 요일/시간에 스캔이 많이 발생했다는 뜻입니다.")}
                {periodTip("qr-heat")}
                <div style={{overflowX:"auto",paddingBottom:4}}>
                  <div style={{display:"grid",gridTemplateColumns:"44px repeat(7, minmax(54px,1fr))",gap:5,minWidth:520}}>
                    <div/>
                    {qrDayLabels.map(day=><div key={day} style={{fontSize:11.5,color:A.t2,fontWeight:600,textAlign:"center" as const}}>{day}</div>)}
                    {qrHourLabels.map((hour,h)=><React.Fragment key={hour}>
                      <div style={{fontSize:10.5,color:A.t3,textAlign:"right" as const,paddingRight:5,lineHeight:"20px"}}>{hour}</div>
                      {qrDayLabels.map((_,d)=>{const count=qrHeat[`${d}-${h}`]||0;const alpha=count?0.2+Math.min(0.72,count/qrHeatMax*0.72):0;return <div key={`${d}-${h}`} onMouseMove={e=>movePeriodTip("qr-heat",e,{title:`${qrDayLabels[d]}요일 ${hour}`,color:chartBlue,lines:[`스캔 : ${count}`]})} onMouseLeave={()=>setPeriodHover(null)}
                        style={{height:20,borderRadius:5,background:count?chartBlue:A.card2,opacity:count?alpha:1,border:`1px solid ${count?chartBlue+"22":A.border}`,cursor:"pointer"}}/>})}
                    </React.Fragment>)}
                  </div>
                </div>
              </div>
            </>}
          </div>}
        </>}
        </div>
	      </div>
	      {showAnalyticsTrash&&(
	        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10001,padding:22,boxSizing:"border-box" as const}} onClick={()=>!analyticsTrashBusy&&setShowAnalyticsTrash(false)}>
	          <div style={{width:620,maxWidth:"94vw",maxHeight:"82vh",background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,boxShadow:A.shadow,overflow:"hidden",display:"flex",flexDirection:"column" as const}} onClick={e=>e.stopPropagation()}>
	            <div style={{height:60,padding:"0 18px",borderBottom:`1px solid ${A.border}`,display:"flex",alignItems:"center",gap:11,flexShrink:0}}>
	              <div style={{width:34,height:34,borderRadius:A.r,background:A.blue2,color:A.blue,display:"flex",alignItems:"center",justifyContent:"center"}}>
	                <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M6 5V3.5h4V5M5 7v5M8 7v5M11 7v5M4 5l.55 8.2c.04.45.4.8.85.8h5.2c.45 0 .81-.35.85-.8L12 5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>
	              </div>
	              <div style={{flex:1,minWidth:0}}>
	                <div style={{fontSize:17,fontWeight:700,color:A.t1,letterSpacing:"-.2px"}}>응답 휴지통</div>
	                <div style={{fontSize:12,color:A.t3,marginTop:3}}>실수로 삭제한 응답을 다시 복구할 수 있어요.</div>
	              </div>
	              <button onClick={()=>setShowAnalyticsTrash(false)} disabled={analyticsTrashBusy} style={{width:32,height:32,borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t2,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
	            </div>
	            <div style={{padding:16,overflow:"auto",display:"flex",flexDirection:"column" as const,gap:9}}>
	              {trashRecords.length===0?<div style={{padding:"34px 16px",borderRadius:A.r,border:`1px dashed ${A.border2}`,color:A.t3,fontSize:13,textAlign:"center" as const}}>휴지통이 비어 있어요.</div>:trashRecords.map(event=>{
	                const meta=analyticsEventMeta(event)
	                const row=meta.original_row||{}
	                const whole=event.event_type==="analytics_scope_trashed"
	                const draft=meta.trash_kind==="draft"
	                const title=whole?"전체 응답 삭제 기록":draft?"작성 중 응답":row.name||row.email||row.phone||"제출 응답"
	                const detail=whole?`${meta.deleted_count||0}개 제출 응답과 삭제 당시 분석 기록`:draft?`세션 ${String(meta.session_id||"").slice(0,18)}`:fmtAnalyticsDate(row.created_at).filter(Boolean).join(" ")
	                return <div key={event.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 13px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2}}>
	                  <div style={{width:34,height:34,borderRadius:A.r,background:whole?A.red+"14":A.blue2,color:whole?A.red:A.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
	                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d={whole?"M3 5h10M6 5V3.5h4V5M5 7v5M8 7v5M11 7v5M4 5l.55 8.2c.04.45.4.8.85.8h5.2c.45 0 .81-.35.85-.8L12 5":"M3 8a5 5 0 1 0 1.46-3.54M3 3.5v3h3"} stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>
	                  </div>
	                  <div style={{flex:1,minWidth:0}}>
	                    <div style={{fontSize:13.5,fontWeight:600,color:A.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{title}</div>
	                    <div style={{fontSize:12,color:A.t3,marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{detail}</div>
	                  </div>
	                  <button onClick={()=>restoreAnalyticsTrash(event)} disabled={analyticsTrashBusy} style={{height:32,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.blue}44`,background:A.blue2,color:A.blue,fontFamily:FONT,fontSize:12,fontWeight:600,cursor:"pointer"}}>복구</button>
	                  <button onClick={()=>purgeAnalyticsTrash(event)} disabled={analyticsTrashBusy} style={{height:32,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card,color:A.red,fontFamily:FONT,fontSize:12,fontWeight:600,cursor:"pointer"}}>영구 삭제</button>
	                </div>
	              })}
	            </div>
	          </div>
	        </div>
	      )}
	      {showDeleteAllAnalytics&&(
	        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10001,padding:22,boxSizing:"border-box" as const}} onClick={()=>setShowDeleteAllAnalytics(false)}>
	          <div style={{width:420,maxWidth:"92vw",background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,boxShadow:A.shadow,padding:22}} onClick={e=>e.stopPropagation()}>
	            <div style={{width:44,height:44,borderRadius:A.r,background:A.red+"14",color:A.red,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
	              <svg width="22" height="22" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M6 4V2.8h4V4M5 6v6M8 6v6M11 6v6M4 4l.6 10h6.8L12 4" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round"/></svg>
	            </div>
	            <div style={{fontSize:17,fontWeight:700,color:A.t1,letterSpacing:"-.2px",marginBottom:8}}>응답 데이터를 모두 삭제할까요?</div>
	            <div style={{fontSize:13,color:A.t2,lineHeight:1.65,marginBottom:18}}>
	              현재 폼의 제출 응답과 분석 기록을 휴지통으로 이동합니다. 휴지통에서 다시 복구할 수 있어요.
	            </div>
	            <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
	              <button onClick={()=>setShowDeleteAllAnalytics(false)} style={{height:38,padding:"0 14px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t2,fontFamily:FONT,fontSize:13,fontWeight:600,cursor:"pointer"}}>취소</button>
	              <button onClick={deleteAllAnalyticsData} style={{height:38,padding:"0 14px",borderRadius:A.r,border:"none",background:A.red,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:600,cursor:"pointer"}}>휴지통으로 이동</button>
	            </div>
	          </div>
	        </div>
	      )}
	      {editResponse&&(
	        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.48)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10002,padding:22,boxSizing:"border-box" as const}} onClick={()=>!editResponseSaving&&setEditResponse(null)}>
	          <div style={{width:720,maxWidth:"94vw",maxHeight:"86vh",background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,boxShadow:A.shadow,overflow:"hidden",display:"flex",flexDirection:"column" as const}} onClick={e=>e.stopPropagation()}>
	            <div style={{height:58,borderBottom:`1px solid ${A.border}`,display:"flex",alignItems:"center",gap:12,padding:"0 18px",flexShrink:0}}>
	              <div style={{width:34,height:34,borderRadius:A.r,background:A.blue2,color:A.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
	                <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M3 11.5V13h1.5L12 5.5 10.5 4 3 11.5zM9.8 4.7l1.5 1.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round"/></svg>
	              </div>
	              <div style={{minWidth:0,flex:1}}>
	                <div style={{fontSize:17,fontWeight:700,color:A.t1,letterSpacing:"-.2px"}}>응답 데이터 수정</div>
	                <div style={{fontSize:12,color:A.t3,marginTop:3}}>{fmtAnalyticsDate(editResponse.row.created_at).filter(Boolean).join(" ")}</div>
	              </div>
	              <button onClick={()=>!editResponseSaving&&setEditResponse(null)} disabled={editResponseSaving} style={{width:32,height:32,borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t2,cursor:editResponseSaving?"not-allowed":"pointer",fontSize:18,lineHeight:1}}>×</button>
	            </div>
	            <div style={{padding:18,overflow:"auto",display:"grid",gridTemplateColumns:width<900?"1fr":"1fr 1fr",gap:14}}>
	              {editResponseFields.map((field:any)=>{
	                const fileItems=analyticsFileItems(analyticsRawAnswer(editResponse.row,field))
	                const isFile=field.type==="file"
	                return <div key={field.id} style={{gridColumn:field.type==="textarea"||isFile?"1 / -1":undefined}}>
	                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:7}}>
	                    <label style={{fontSize:12.5,fontWeight:600,color:A.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{field.label}</label>
	                    <span style={{fontSize:11,color:A.t3,flexShrink:0}}>{field.consentField?"동의":fieldTypeName(field.type)}</span>
	                  </div>
	                  {field.readOnly
	                    ? <div style={{minHeight:42,borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,padding:"10px 11px",fontSize:12.5,color:A.t1,lineHeight:1.55}}>
	                        {editResponse.values[field.id]||editableAnalyticsValue(editResponse.row,field)||"없음"}
	                        <div style={{fontSize:11.5,color:A.t3,marginTop:5}}>동의 항목은 제출 당시 기록을 표시합니다.</div>
	                      </div>
	                    : isFile
	                    ? <div style={{minHeight:42,borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,padding:"10px 11px",fontSize:12.5,color:A.t2,lineHeight:1.55}}>
	                        {fileItems.length?fileItems.map((file:any,i:number)=><button key={i} onClick={()=>file.url&&setFilePreview(file)} style={{display:"block",border:"none",background:"transparent",padding:0,margin:"0 0 4px",color:file.url?A.blue:A.t2,fontFamily:FONT,fontSize:12.5,fontWeight:500,cursor:file.url?"pointer":"default",textAlign:"left" as const}}>{file.name}</button>):"첨부파일 없음"}
	                        <div style={{fontSize:11.5,color:A.t3,marginTop:5}}>첨부파일은 이 화면에서 교체하지 않고, 응답 내용만 수정됩니다.</div>
	                      </div>
	                    : <textarea value={editResponse.values[field.id]||""} onChange={e=>setEditResponse(prev=>prev?{...prev,values:{...prev.values,[field.id]:e.target.value}}:prev)}
	                        placeholder={field.type==="checkbox"?"복수 선택값은 줄바꿈으로 구분해 주세요.":"수정할 값을 입력해주세요."}
	                        style={{width:"100%",height:field.type==="textarea"?104:68,borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t1,fontFamily:FONT,fontSize:13,fontWeight:400,lineHeight:1.5,padding:"9px 10px",outline:"none",resize:"vertical" as const,boxSizing:"border-box" as const}}/>}
	                </div>
	              })}
	            </div>
	            <div style={{borderTop:`1px solid ${A.border}`,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexShrink:0}}>
	              <div style={{fontSize:12,color:A.t3,lineHeight:1.5}}>저장하면 응답별 데이터, 질문별 인사이트, CSV 다운로드에 바로 반영됩니다.</div>
	              <div style={{display:"flex",gap:8,flexShrink:0}}>
	                <button onClick={()=>setEditResponse(null)} disabled={editResponseSaving} style={{height:38,padding:"0 14px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t2,fontFamily:FONT,fontSize:13,fontWeight:600,cursor:editResponseSaving?"not-allowed":"pointer"}}>취소</button>
	                <button onClick={()=>saveEditedAnalyticsRow(editResponseFields)} disabled={editResponseSaving} style={{height:38,padding:"0 15px",borderRadius:A.r,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:600,cursor:editResponseSaving?"wait":"pointer"}}>{editResponseSaving?"저장 중...":"저장"}</button>
	              </div>
	            </div>
	          </div>
	        </div>
	      )}
	      {filePreview&&(
        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10002,padding:22,boxSizing:"border-box" as const}} onClick={()=>setFilePreview(null)}>
          <div style={{width:820,maxWidth:"92vw",height:620,maxHeight:"86vh",background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,boxShadow:A.shadow,overflow:"hidden",display:"flex",flexDirection:"column" as const}} onClick={e=>e.stopPropagation()}>
            <div style={{height:54,borderBottom:`1px solid ${A.border}`,display:"flex",alignItems:"center",gap:12,padding:"0 16px",flexShrink:0}}>
              <div style={{flex:1,minWidth:0,fontSize:14,fontWeight:600,color:A.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{filePreview.name}</div>
              <button onClick={()=>downloadAnalyticsFile(filePreview)} style={{height:32,padding:"0 12px",borderRadius:A.r,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>다운로드</button>
              <button onClick={()=>setFilePreview(null)} style={{width:32,height:32,borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t2,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
            </div>
            <div style={{flex:1,minHeight:0,background:A.card2,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
              {(/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filePreview.name)||String(filePreview.type||"").startsWith("image/"))
                ? <img src={filePreview.url} alt={filePreview.name} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain",borderRadius:A.r,background:A.card}}/>
                : (/\.pdf$/i.test(filePreview.name)||String(filePreview.type||"").includes("pdf"))
                ? <iframe src={filePreview.url} title={filePreview.name} style={{width:"100%",height:"100%",border:"none",borderRadius:A.r,background:A.card}}/>
                : <div style={{textAlign:"center" as const,color:A.t2,fontSize:13,lineHeight:1.7}}>
                    <div style={{fontSize:15,fontWeight:600,color:A.t1,marginBottom:6}}>미리보기를 지원하지 않는 파일 형식입니다.</div>
                    <div>상단의 다운로드 버튼으로 파일을 확인해주세요.</div>
                  </div>}
            </div>
          </div>
        </div>
      )}
      {renderUpdateRefreshPrompt()}
    </div>
    } catch(e){
      const msg=(e as any)?.message||"알 수 없는 오류"
      return <div style={{width,height,display:"flex",alignItems:"center",justifyContent:"center",background:A.bg,color:A.t1,fontFamily:FONT,padding:32,WebkitFontSmoothing:"antialiased"}}>
        <div style={{maxWidth:520,background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:24,boxShadow:A.shadow}}>
          <div style={{fontSize:18,fontWeight:700,letterSpacing:"-.2px",marginBottom:8}}>응답 및 분석 화면 오류</div>
          <div style={{fontSize:13,color:A.red,lineHeight:1.6,marginBottom:16}}>{msg}</div>
          <Btn onClick={returnToBuilderFromAnalytics} sm A={A}>편집으로 돌아가기</Btn>
        </div>
      </div>
    }
  }

  // ── Builder layout ────────────────────────────────────────────────────
  const SW=216, PW=rightPanelW

  if((view as string)==="analytics")return renderAnalyticsPage()

  return (
    <div style={{width,height,display:"flex",flexDirection:"column" as const,background:A.bg,color:A.t1,fontFamily:FONT,overflow:"hidden",position:"relative" as const,WebkitFontSmoothing:"antialiased"}}>
      {renderEditorTabsStrip()}

      {/* TOPBAR */}
      <div style={{height:58,background:A.card,borderBottom:`1px solid ${A.border}`,display:"flex",alignItems:"center",padding:"0 20px",gap:12,flexShrink:0}}>
        <button onClick={()=>{rememberActiveEditorTab();setView("dashboard")}} style={{display:"flex",alignItems:"center",gap:8,background:"transparent",border:"none",cursor:"pointer",padding:0}}>
          <FlickMark size={30}/>
        </button>
        <button onClick={()=>{rememberActiveEditorTab();setView("dashboard")}} style={{height:32,padding:"0 10px",display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",borderRadius:A.r,cursor:"pointer",color:A.t2,fontSize:12.5,fontWeight:500,fontFamily:FONT}}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>대시보드</span>
        </button>
        {currentBrand&&<>
          <div style={{width:1,height:18,background:A.border}}/>
          <div style={{display:"flex",alignItems:"center",flexShrink:0}}>
            <BrandLogo brand={currentBrand} height={currentBrand==="SNIPERFACTORY"?20:15} dark={adminDark}/>
          </div>
        </>}
        {loadedName&&<span style={{fontSize:14,fontWeight:700,color:A.t1,maxWidth:280,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{loadedName}</span>}
        {loadedId&&<span style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:6,background:autoSaving?A.card2:"#E7F6EE",color:autoSaving?A.t3:"#0F8A47",fontSize:11.5,fontWeight:600,transition:"color .3s, background .3s",whiteSpace:"nowrap" as const,flexShrink:0}}>
          {autoSaving
            ? <><svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{animation:"spin 1s linear infinite"}}><path d="M8 2a6 6 0 1 0 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>저장 중</>
            : autoSaved
              ? <><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>저장됨</>
              : null}
        </span>}
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <div style={{flex:1}}/>
        <div style={{position:"relative" as const}}>
          <button
            onMouseEnter={()=>setShowBuilderSettingsTip(true)}
            onMouseLeave={()=>setShowBuilderSettingsTip(false)}
            onClick={openBuilderSettings}
            style={{width:34,height:34,borderRadius:A.r,border:"none",background:"transparent",color:A.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
            aria-label="폼 설정">
            <GearIcon size={16}/>
          </button>
          {showBuilderSettingsTip&&<div style={{position:"absolute" as const,top:"calc(100% + 7px)",left:"50%",transform:"translateX(-50%)",background:A.t1,color:A.card,padding:"5px 8px",borderRadius:6,fontSize:11.5,fontWeight:600,whiteSpace:"nowrap" as const,zIndex:1000,boxShadow:A.shadow}}>폼 설정</div>}
        </div>
        <div style={{position:"relative" as const}}>
          <button
            onMouseEnter={()=>setShowAnalyticsTip(true)}
            onMouseLeave={()=>setShowAnalyticsTip(false)}
            onClick={()=>{
              if(!loadedId){showToast("폼을 먼저 저장해주세요",false);return}
              setAnalyticsTab("responses")
              setView("analytics")
            }}
            style={{width:34,height:34,borderRadius:A.r,border:"none",background:"transparent",color:A.t3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
            aria-label="응답 및 분석">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 20V11M10 20V4M16 20v-6M22 20H2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
            </svg>
          </button>
          {showAnalyticsTip&&<div style={{position:"absolute" as const,top:"calc(100% + 7px)",left:"50%",transform:"translateX(-50%)",background:A.t1,color:A.card,padding:"5px 8px",borderRadius:6,fontSize:11.5,fontWeight:600,whiteSpace:"nowrap" as const,zIndex:1000,boxShadow:A.shadow}}>응답 및 분석</div>}
        </div>
        <button onClick={onSaveClick} style={{height:34,padding:"0 13px",border:"none",borderRadius:A.r,background:A.card2,color:A.t2,fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:"pointer",flexShrink:0}}>저장</button>
        <button onClick={publishAndOpenForm} style={{height:34,padding:"0 14px",border:"none",borderRadius:A.r,background:A.blue,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:600,boxShadow:"0 1px 2px rgba(49,130,246,.35)",cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}><path d="M6.5 3H3.6A.6.6 0 0 0 3 3.6v8.8a.6.6 0 0 0 .6.6h8.8a.6.6 0 0 0 .6-.6V9.5M9.5 2.5H13.5V6.5M13 3l-5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          폼 열기
        </button>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* SIDEBAR */}
        <nav ref={sbRef} onMouseMove={e=>{const r=sbRef.current?.getBoundingClientRect();if(r)myPos.current=e.clientY-r.top}} onMouseEnter={()=>setOverSb(true)} onMouseLeave={()=>setOverSb(false)}
          style={{width:SW,background:adminDark?A.bg:"#FAFBFC",overflowY:"auto" as const,flexShrink:0,display:"flex",flexDirection:"column" as const,scrollbarWidth:"none" as any,padding:"16px 12px",boxSizing:"border-box" as const}}>

          {/* Nav */}
          {NAV.map(grp=>(
            <div key={grp.group} style={{padding:"0 0 18px",flexShrink:0}}>
              <div style={{fontSize:11,fontWeight:700,color:A.t3,letterSpacing:".4px",padding:"0 8px 8px"}}>{grp.group}</div>
              {grp.items.map(item=>{const a=sec===item.id;return(
                <div key={item.id} onClick={()=>setSec(item.id)}
                  style={{height:36,display:"flex",alignItems:"center",gap:8,padding:"0 10px",borderRadius:A.r,cursor:"pointer",fontSize:13,fontWeight:a?700:500,color:a?A.t1:A.t2,background:a?(adminDark?A.card2:"#EDEFF3"):"transparent",marginBottom:2,transition:"all .12s"}}>
                  <span style={{flex:1}}>{item.label}</span>
                  {"badge" in item&&<span style={{fontSize:10.5,fontWeight:700,letterSpacing:".3px",padding:"2px 7px",borderRadius:6,background:(item as any).badge==="ON"?A.blue2:(adminDark?A.card2:"#EFF1F4"),color:(item as any).badge==="ON"?A.blue:A.t3}}>{(item as any).badge}</span>}
                </div>
              )})}
            </div>
          ))}

          <div style={{flex:1}}/>
          <div style={{paddingTop:14,flexShrink:0}}>
            <button onClick={()=>setShowBrandModal(true)} style={{width:"100%",height:34,display:"flex",alignItems:"center",justifyContent:"center",gap:6,border:`1px solid ${adminDark?A.border:"#E3E7EC"}`,borderRadius:A.r,background:A.card,color:adminDark?A.t2:"#3D4552",fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              새 폼 만들기
            </button>
          </div>
        </nav>

        {/* PREVIEW — 중앙 */}
        <div style={{flex:1,display:"flex",flexDirection:"column" as const,overflow:"hidden",minWidth:0,background:adminDark?A.bg:"#F1F3F6"}}>
          <div style={{flex:1,overflowY:"auto" as const,display:"flex",alignItems:"flex-start" as const,padding:"28px 32px",boxSizing:"border-box" as const}}>
            {renderPreview()}
          </div>
        </div>

        {/* SETTINGS PANEL — 우측 */}
        <div style={{width:PW,background:A.card,boxShadow:`inset 1px 0 0 ${A.border}`,overflowY:"auto" as const,flexShrink:0,scrollbarWidth:"none" as any,position:"relative" as const}}>
          {/* 드래그 리사이즈 핸들 */}
          <div
            style={{position:"absolute" as const,left:0,top:0,bottom:0,width:5,cursor:"col-resize",zIndex:20,background:"transparent"}}
            onMouseDown={e=>{
              e.preventDefault()
              isResizingRef.current=true
              const startX=e.clientX
              const startW=rightPanelW
              const onMove=(ev:MouseEvent)=>{
                if(!isResizingRef.current)return
                const delta=startX-ev.clientX
                setRightPanelW(Math.min(600,Math.max(280,startW+delta)))
              }
              const onUp=()=>{
                isResizingRef.current=false
                document.removeEventListener("mousemove",onMove)
                document.removeEventListener("mouseup",onUp)
                document.body.style.cursor=""
                document.body.style.userSelect=""
              }
              document.body.style.cursor="col-resize"
              document.body.style.userSelect="none"
              document.addEventListener("mousemove",onMove)
              document.addEventListener("mouseup",onUp)
            }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.blue+"44"}}
            onMouseLeave={e=>{if(!isResizingRef.current)(e.currentTarget as HTMLElement).style.background="transparent"}}
          />
          <div style={{padding:"18px 20px 14px",position:"sticky" as const,top:0,background:A.card,zIndex:10}}>
            <div style={{fontSize:15,fontWeight:700,color:A.t1,letterSpacing:"-.2px"}}>{NAV.flatMap(g=>g.items).find(i=>i.id===sec)?.label||sec}</div>
            {PANEL_SUBS[sec]&&<div style={{fontSize:12,color:A.t3,lineHeight:1.5,marginTop:4}}>{PANEL_SUBS[sec]}</div>}
          </div>
          {renderPanel()}
        </div>

      </div>

      {/* BRAND MODAL in builder */}
      {showBrandModal&&(
        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9998}} onClick={()=>setShowBrandModal(false)}>
          <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:16,padding:"26px 26px 22px",width:360,boxShadow:A.shadow,position:"relative" as const}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setShowBrandModal(false)} style={{position:"absolute",top:12,right:12,width:26,height:26,borderRadius:"50%",border:`1px solid ${A.border}`,background:A.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:A.t3,lineHeight:1}}>×</button>
            <div style={{fontSize:17,fontWeight:700,color:A.t1,letterSpacing:"-.2px",marginBottom:6}}>어떤 브랜드 폼을 만들까요?</div>
            <div style={{fontSize:12.5,color:A.t3,marginBottom:18}}>현재 작업 중인 내용은 초기화됩니다</div>
            <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
              <button onClick={()=>startNewForm("SNIPERFACTORY")}
                style={{padding:"18px 20px",borderRadius:10,border:`1px solid ${A.border2}`,background:"transparent",cursor:"pointer",textAlign:"left" as const,fontFamily:FONT,transition:"all .15s"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card2}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                <SFLogo height={20} dark={adminDark}/>
              </button>
              <button onClick={()=>startNewForm("INSIDEOUT")}
                style={{padding:"18px 20px",borderRadius:10,border:`1px solid ${A.border2}`,background:"transparent",cursor:"pointer",textAlign:"left" as const,fontFamily:FONT,transition:"all .15s"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card2}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                <IOLogo height={16} dark={adminDark}/>
              </button>
              <button onClick={()=>startNewForm("SFACSPACE")}
                style={{padding:"18px 20px",borderRadius:10,border:`1px solid ${A.border2}`,background:"transparent",cursor:"pointer",textAlign:"left" as const,fontFamily:FONT,transition:"all .15s"}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card2}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent"}}>
                <SfacspaceLogo height={16} dark={adminDark}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE MODAL */}
      {showTemplateModal&&(
        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={()=>{setShowTemplateModal(false);setPendingBrand(null)}}>
          <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:16,padding:"28px 24px",width:420,boxShadow:A.shadow,position:"relative" as const}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>{setShowTemplateModal(false);setPendingBrand(null)}} style={{position:"absolute",top:14,right:14,width:28,height:28,borderRadius:"50%",border:`1px solid ${A.border}`,background:A.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:A.t3,lineHeight:1}}>×</button>
            <div style={{fontSize:18,fontWeight:700,color:A.t1,marginBottom:6,letterSpacing:"-0.2px"}}>어떤 형식의 폼을 만들까요?</div>
            <div style={{fontSize:13,color:A.t3,marginBottom:20}}>
              {brandDisplayName(pendingBrand||"")} 브랜드 폼
            </div>
            <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
              {[
                {id:"alert" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label:"사전 알림 신청폼", desc:"오픈 소식을 먼저 받아보고 싶은 분들을 위한 간단한 신청폼"},
                {id:"kdt" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="9" y="3" width="6" height="4" rx="1.5" stroke={A.t2} strokeWidth="1.8"/><line x1="9" y1="12" x2="15" y2="12" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round"/><line x1="9" y1="16" x2="13" y2="16" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round"/></svg>,
                  label:"교육과정 신청폼", desc:"교육과정 모집 응답을 받기 위한 신청 폼"},
                {id:"edu_biz" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4z" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label:"교육 사업 신청폼", desc:"기업 대상 교육 사업 신청을 받는 폼"},
                {id:"company" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label:"참여기업 프로그램 신청폼", desc:"참여 기업 모집 및 프로그램 신청을 받는 폼"},
                {id:"recruit" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label:"채용 폼", desc:"입사 지원자를 모집하는 채용 신청폼"},
                {id:"blank" as const,
                  icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke={A.t2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                  label:"빈 템플릿", desc:"아무것도 없이 처음부터 직접 만들어나가는 폼"},
              ].map(t=>(
                <button key={t.id} onClick={()=>applyTemplate(t.id)}
                  style={{width:"100%",padding:"14px 16px",borderRadius:A.r2,border:`1px solid ${A.border}`,background:"transparent",cursor:"pointer",textAlign:"left" as const,fontFamily:FONT,transition:"all .12s",display:"flex",alignItems:"flex-start",gap:14}}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=A.card2;(e.currentTarget as HTMLElement).style.borderColor=A.border2}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.borderColor=A.border}}>
                  <div style={{flexShrink:0,marginTop:1}}>{t.icon}</div>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:600,color:A.t1,marginBottom:3}}>{t.label}</div>
                    <div style={{fontSize:12,color:A.t3,lineHeight:1.5}}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {dashboardSettings&&(()=>{
        const settingsConfig=dashboardSettings.item.__fromBuilder?cfg:dashboardSettings.item.config
        const program=progs.find(p=>p.id===settingsConfig?.header?.programId)
        const recruitmentMode=recruitmentPeriodModeOf(settingsConfig)
        const recruitment=recruitmentPeriodOf(program,recruitmentMode)
        const hasRecruitmentPeriod=!!(recruitment.start||recruitment.end)
        return <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={()=>setDashboardSettings(null)}>
          <div style={{width:500,maxWidth:"92vw",maxHeight:"88vh",overflowY:"auto" as const,padding:24,borderRadius:16,background:A.card,border:`1px solid ${A.border}`,boxShadow:A.shadow}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:17,fontWeight:700,color:A.t1,letterSpacing:"-.2px",marginBottom:5}}>폼 설정</div>
            <div style={{fontSize:12.5,color:A.t3,marginBottom:20}}>폼 제목, 브랜드, 폼 유형과 운영 기준을 정합니다.</div>
            <div style={{fontSize:12.5,fontWeight:700,color:A.t2,marginBottom:8}}>폼 제목</div>
            <input value={dashboardSettings.formName} onChange={e=>setDashboardSettings(prev=>prev&&({...prev,formName:e.target.value}))} placeholder="폼 제목" style={{width:"100%",height:38,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t1,fontFamily:FONT,fontSize:13,marginBottom:16,boxSizing:"border-box" as const}}/>
            <div style={{fontSize:12.5,fontWeight:700,color:A.t2,marginBottom:8}}>브랜드</div>
            <div style={{marginBottom:16}}><PanelSelect value={dashboardSettings.brand} onChange={v=>setDashboardSettings(prev=>prev&&({...prev,brand:v as BrandId}))} A={A} height={38} options={[{value:"SNIPERFACTORY",label:"스나이퍼팩토리"},{value:"INSIDEOUT",label:"인사이드아웃"},{value:"SFACSPACE",label:"스팩스페이스"}]}/></div>
            <div style={{fontSize:12.5,fontWeight:700,color:A.t2,marginBottom:8}}>폼 유형</div>
            <div style={{marginBottom:16}}><PanelSelect value={dashboardSettings.formTypeTag} onChange={v=>setDashboardSettings(prev=>prev&&({...prev,formTypeTag:v as DashboardFormType}))} A={A} height={38} options={DASHBOARD_FORM_TYPES.map(t=>({value:t.value,label:t.label}))}/></div>
            <div style={{fontSize:12.5,fontWeight:700,color:A.t2,marginBottom:8}}>편집 비밀번호</div>
            {!!settingsConfig?.dashboard?.editPasswordHash&&!canMasterReset(authRole)&&<input type="password" value={dashboardSettings.currentEditPasswordDraft} onChange={e=>setDashboardSettings(prev=>prev&&({...prev,currentEditPasswordDraft:e.target.value}))} placeholder="변경 또는 해제 시 현재 비밀번호" style={{width:"100%",height:38,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t1,fontFamily:FONT,fontSize:13,marginBottom:8,boxSizing:"border-box" as const}}/>}
            <input type="password" value={dashboardSettings.editPasswordDraft} disabled={dashboardSettings.clearEditPassword} onChange={e=>setDashboardSettings(prev=>prev&&({...prev,editPasswordDraft:e.target.value}))} placeholder={settingsConfig?.dashboard?.editPasswordHash?"새 비밀번호 입력 시 변경":"비밀번호 입력 시 편집 보호"} style={{width:"100%",height:38,padding:"0 10px",borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t1,fontFamily:FONT,fontSize:13,boxSizing:"border-box" as const,opacity:dashboardSettings.clearEditPassword?.55:1}}/>
            <div style={{fontSize:11.5,color:A.t3,lineHeight:1.55,margin:"6px 0 9px"}}>{canMasterReset(authRole)&&settingsConfig?.dashboard?.editPasswordHash?"master 권한 계정은 현재 비밀번호 없이 편집 비밀번호를 변경하거나 해제할 수 있어요.":"설정하면 대시보드에서 편집을 열 때 비밀번호를 확인합니다. 원문 대신 해시값만 저장됩니다."}</div>
            {!!settingsConfig?.dashboard?.editPasswordHash&&<label style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,color:A.t2,cursor:"pointer",marginBottom:16}}><input type="checkbox" checked={dashboardSettings.clearEditPassword} onChange={e=>setDashboardSettings(prev=>prev&&({...prev,clearEditPassword:e.target.checked,editPasswordDraft:e.target.checked?"":prev.editPasswordDraft}))}/>편집 비밀번호 해제</label>}
            {hasRecruitmentPeriod&&<div style={{padding:"11px 12px",marginBottom:16,borderRadius:A.r,background:A.blue2,border:`1px solid ${A.blue}33`,fontSize:12.5,color:A.blue,lineHeight:1.6}}>프로그램 DB의 {recruitmentPeriodLabel(recruitmentMode)}을 기본 운영 기간으로 불러왔어요.<br/>필요하면 아래에서 기간을 추가하거나 수정할 수 있습니다.<br/>{recruitmentPeriodText(recruitment,"기간 데이터 없음")}</div>}
            <div style={{fontSize:12,fontWeight:600,color:A.t3,marginBottom:9}}>폼 운영 기간</div>
            <label style={{display:"inline-flex",alignItems:"center",gap:7,fontSize:12,color:A.t2,cursor:"pointer",marginBottom:8}}>
              <input type="checkbox" checked={dashboardSettings.alwaysOpen} onChange={e=>setDashboardSettings(prev=>prev&&({...prev,alwaysOpen:e.target.checked,manualStatus:""}))}/>
              상시 운영
            </label>
            <div style={{fontSize:11.5,color:A.t3,lineHeight:1.5,marginBottom:9}}>체크하면 기간과 관계없이 진행중으로 표시됩니다. 체크를 꺼도 설정해둔 기간은 유지됩니다.</div>
            <div style={{marginBottom:16}}>
              <OperationPeriodsEditor periods={dashboardSettings.operationPeriods} disabled={dashboardSettings.alwaysOpen} A={A} onChange={operationPeriods=>setDashboardSettings(prev=>{
                if(!prev)return prev
                const primary=primaryOperationRange(operationPeriods)
                return{...prev,operationPeriods,operationStart:primary.start,operationEnd:primary.end}
              })}/>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
              <button onClick={()=>setDashboardSettings(null)} style={{height:38,padding:"0 14px",borderRadius:A.r,border:`1px solid ${A.border}`,background:"transparent",color:A.t2,fontFamily:FONT,fontSize:13,cursor:"pointer"}}>취소</button>
              <button onClick={saveDashboardSettings} disabled={dashboardSettingsSaving} style={{height:38,padding:"0 16px",borderRadius:A.r,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:13,fontWeight:700,cursor:"pointer"}}>{dashboardSettingsSaving?"저장 중...":"저장"}</button>
            </div>
          </div>
        </div>
      })()}

      {/* UPDATE MODAL */}
      {showUpdateModal&&(
        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={()=>setShowUpdateModal(false)}>
          <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:28,width:cfg.header.programUnlinked?500:320,boxShadow:A.shadow}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:17,fontWeight:700,color:A.t1,letterSpacing:"-.2px",marginBottom:8}}>수정 사항 저장</div>
            <div style={{fontSize:13.5,color:A.t2,marginBottom:6}}><span style={{fontWeight:600,color:A.t1}}>"{loadedName}"</span>에 변경 사항을 덮어쓰시겠어요?</div>
            <div style={{fontSize:12,color:A.t3,marginBottom:22,lineHeight:1.5}}>기존 설정이 수정된 내용으로 교체됩니다.</div>
            {cfg.header.programUnlinked&&<div style={{padding:"12px 12px 11px",marginBottom:16,borderRadius:A.r,background:A.blue2,border:`1px solid ${A.blue}33`}}>
              <div style={{fontSize:12,fontWeight:700,color:A.blue,marginBottom:5}}>폼 운영 기간</div>
              <div style={{fontSize:11.5,color:A.t2,lineHeight:1.5,marginBottom:8}}>교육과정 연동을 하지 않는 폼은 운영 기간을 설정해야 합니다.</div>
              <OperationPeriodsEditor compact periods={operationPeriodsFromDashboard(cfg.dashboard)} onChange={setOperationPeriods} A={A}/>
            </div>}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn onClick={()=>{setShowUpdateModal(false);setShowSave(true)}} sm A={A}>새 이름으로 저장</Btn>
              <Btn onClick={()=>setShowUpdateModal(false)} sm A={A}>취소</Btn>
              <Btn onClick={updateCfg} variant="blue" sm A={A}>수정 저장</Btn>
            </div>
          </div>
        </div>
      )}

      {/* SAVE MODAL */}
      {showSave&&(
        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={()=>setShowSave(false)}>
          <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,padding:28,width:cfg.header.programUnlinked?500:310,boxShadow:A.shadow}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:17,fontWeight:700,color:A.t1,letterSpacing:"-.2px",marginBottom:18}}>설정 저장</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12.5,fontWeight:700,color:A.t2,marginBottom:8}}>설정 이름</div>
              <input value={saveName} onChange={e=>setSaveName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveCfg()} placeholder="예) UXUI 9기 오픈폼"
                style={{width:"100%",background:A.card2,border:`1.5px solid ${A.border}`,borderRadius:A.r,color:A.t1,fontFamily:FONT,fontSize:13.5,padding:"9px 11px",outline:"none",boxSizing:"border-box" as const}}/>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12.5,fontWeight:700,color:A.t2,marginBottom:8}}>슬러그 <span style={{fontWeight:400,color:A.t3}}>(비워두면 자동)</span></div>
              <input value={saveSlug} onChange={e=>setSaveSlug(e.target.value)} placeholder="uxui-9th-open"
                style={{width:"100%",background:A.card2,border:`1.5px solid ${A.border}`,borderRadius:A.r,color:A.t1,fontFamily:FONT,fontSize:13,padding:"8px 11px",outline:"none",boxSizing:"border-box" as const}}/>
            </div>
            {cfg.header.programUnlinked&&<div style={{padding:"12px 12px 11px",marginBottom:14,borderRadius:A.r,background:A.blue2,border:`1px solid ${A.blue}33`}}>
              <div style={{fontSize:12,fontWeight:700,color:A.blue,marginBottom:5}}>폼 운영 기간</div>
              <div style={{fontSize:11.5,color:A.t2,lineHeight:1.5,marginBottom:8}}>교육과정 연동을 하지 않는 폼은 운영 기간을 설정해야 합니다.</div>
              <OperationPeriodsEditor compact periods={operationPeriodsFromDashboard(cfg.dashboard)} onChange={setOperationPeriods} A={A}/>
            </div>}
            {saveErr&&<div style={{fontSize:12,color:A.red,marginBottom:10,padding:"8px 10px",borderRadius:A.r,background:"rgba(232,92,92,0.06)",border:"1px solid rgba(232,92,92,0.18)"}}>{saveErr}</div>}
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn onClick={()=>setShowSave(false)} sm A={A}>취소</Btn>
              <Btn onClick={saveCfg} variant="blue" disabled={saving} sm A={A}>{saving?"저장 중...":"저장"}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* FILE PREVIEW MODAL */}
      {filePreview&&(
        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10002,padding:22,boxSizing:"border-box" as const}} onClick={()=>setFilePreview(null)}>
          <div style={{width:820,maxWidth:"92vw",height:620,maxHeight:"86vh",background:A.card,border:`1px solid ${A.border}`,borderRadius:A.r2,boxShadow:A.shadow,overflow:"hidden",display:"flex",flexDirection:"column" as const}} onClick={e=>e.stopPropagation()}>
            <div style={{height:54,borderBottom:`1px solid ${A.border}`,display:"flex",alignItems:"center",gap:12,padding:"0 16px",flexShrink:0}}>
              <div style={{flex:1,minWidth:0,fontSize:14,fontWeight:600,color:A.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" as const}}>{filePreview.name}</div>
              <button onClick={()=>downloadAnalyticsFile(filePreview)} style={{height:32,padding:"0 12px",borderRadius:A.r,border:"none",background:A.blue,color:"#fff",fontFamily:FONT,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>다운로드</button>
              <button onClick={()=>setFilePreview(null)} style={{width:32,height:32,borderRadius:A.r,border:`1px solid ${A.border}`,background:A.card2,color:A.t2,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
            </div>
            <div style={{flex:1,minHeight:0,background:A.card2,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
              {(/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(filePreview.name)||String(filePreview.type||"").startsWith("image/"))
                ? <img src={filePreview.url} alt={filePreview.name} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"contain",borderRadius:A.r,background:A.card}}/>
                : (/\.pdf$/i.test(filePreview.name)||String(filePreview.type||"").includes("pdf"))
                ? <iframe src={filePreview.url} title={filePreview.name} style={{width:"100%",height:"100%",border:"none",borderRadius:A.r,background:A.card}}/>
                : <div style={{textAlign:"center" as const,color:A.t2,fontSize:13,lineHeight:1.7}}>
                    <div style={{fontSize:15,fontWeight:600,color:A.t1,marginBottom:6}}>미리보기를 지원하지 않는 파일 형식입니다.</div>
                    <div>상단의 다운로드 버튼으로 파일을 확인해주세요.</div>
                  </div>}
            </div>
          </div>
        </div>
      )}

      {/* IMAGE CROP MODAL */}
      {imageCropModal&&(
        <div style={{position:"absolute" as const,inset:0,background:"rgba(0,0,0,0.56)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10001,padding:20,boxSizing:"border-box" as const}} onClick={()=>setImageCropModal(null)}>
          <div style={{width:720,maxWidth:"92vw",background:A.card,border:`1px solid ${A.border}`,borderRadius:18,boxShadow:A.shadow,overflow:"hidden"}} onClick={e=>e.stopPropagation()}>
            <div style={{height:72,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",borderBottom:`1px solid ${A.border}`}}>
              <button onClick={()=>setImageCropModal(m=>m?{...m,imageCropX:0,imageCropY:0,imageCropW:100,imageCropH:100}:m)}
                title="원본 전체 선택"
                style={{height:36,padding:"0 12px",border:`1px solid ${A.border}`,borderRadius:A.r,background:A.card2,cursor:"pointer",color:A.t2,fontFamily:FONT,fontSize:12,fontWeight:600}}>
                원본 전체
              </button>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <button onClick={()=>setImageCropModal(null)}
                  style={{height:40,padding:"0 14px",border:"none",background:"transparent",color:A.t2,fontFamily:FONT,fontSize:15,fontWeight:600,cursor:"pointer"}}>취소</button>
                <button onClick={applyImageCropModal}
                  style={{height:42,padding:"0 18px",border:"none",borderRadius:10,background:A.blue,color:"#fff",fontFamily:FONT,fontSize:15,fontWeight:700,cursor:"pointer"}}>저장</button>
              </div>
            </div>
            <div style={{padding:"34px 28px 40px",display:"flex",flexDirection:"column" as const,alignItems:"center",gap:12}}>
              <div
                data-crop-stage
                style={{position:"relative" as const,width:"min(620px,78vw)",aspectRatio:String((imageCropModal.imageNaturalW||4)/(imageCropModal.imageNaturalH||3)),background:A.card2,border:`1px solid ${A.border}`,overflow:"hidden",userSelect:"none" as const}}>
                <img src={imageCropModal.imageUrl} alt="" draggable={false}
                  onLoad={e=>{const im=e.currentTarget;setImageCropModal(m=>m?{...m,imageNaturalW:im.naturalWidth||m.imageNaturalW,imageNaturalH:im.naturalHeight||m.imageNaturalH}:m)}}
                  style={{width:"100%",height:"100%",display:"block",objectFit:"contain",pointerEvents:"none" as const}}/>
                {(()=>{
                  const b=imageCropBox(imageCropModal)
                  const handle=(k:string,s:React.CSSProperties)=><span onMouseDown={e=>startImageCropDrag(k,e)} style={{position:"absolute" as const,zIndex:4,background:k.length===2?A.card:A.t3,border:k.length===2?`3px solid ${A.t3}`:"none",borderRadius:k.length===2?5:999,cursor:k+"-resize",...s}}/>
                  return <>
                    <div style={{position:"absolute" as const,left:0,top:0,right:0,height:`${b.y}%`,background:"rgba(0,0,0,0.34)",pointerEvents:"none" as const}}/>
                    <div style={{position:"absolute" as const,left:0,top:`${b.y+b.h}%`,right:0,bottom:0,background:"rgba(0,0,0,0.34)",pointerEvents:"none" as const}}/>
                    <div style={{position:"absolute" as const,left:0,top:`${b.y}%`,width:`${b.x}%`,height:`${b.h}%`,background:"rgba(0,0,0,0.34)",pointerEvents:"none" as const}}/>
                    <div style={{position:"absolute" as const,left:`${b.x+b.w}%`,top:`${b.y}%`,right:0,height:`${b.h}%`,background:"rgba(0,0,0,0.34)",pointerEvents:"none" as const}}/>
                    <div onMouseDown={e=>startImageCropDrag("move",e)} style={{position:"absolute" as const,left:`${b.x}%`,top:`${b.y}%`,width:`${b.w}%`,height:`${b.h}%`,border:`2px solid ${A.blue}`,boxShadow:`0 0 0 1px ${A.card}`,cursor:"move",zIndex:3,boxSizing:"border-box" as const}}/>
                    {handle("n",{left:`${b.x+b.w/2}%`,top:`${b.y}%`,width:86,height:7,transform:"translate(-50%,-50%)"})}
                    {handle("s",{left:`${b.x+b.w/2}%`,top:`${b.y+b.h}%`,width:86,height:7,transform:"translate(-50%,-50%)"})}
                    {handle("w",{left:`${b.x}%`,top:`${b.y+b.h/2}%`,width:7,height:86,transform:"translate(-50%,-50%)"})}
                    {handle("e",{left:`${b.x+b.w}%`,top:`${b.y+b.h/2}%`,width:7,height:86,transform:"translate(-50%,-50%)"})}
                    {handle("nw",{left:`${b.x}%`,top:`${b.y}%`,width:22,height:22,transform:"translate(-50%,-50%)"})}
                    {handle("ne",{left:`${b.x+b.w}%`,top:`${b.y}%`,width:22,height:22,transform:"translate(-50%,-50%)"})}
                    {handle("sw",{left:`${b.x}%`,top:`${b.y+b.h}%`,width:22,height:22,transform:"translate(-50%,-50%)"})}
                    {handle("se",{left:`${b.x+b.w}%`,top:`${b.y+b.h}%`,width:22,height:22,transform:"translate(-50%,-50%)"})}
                  </>
                })()}
              </div>
              <div style={{fontSize:12,color:A.t3,fontWeight:600}}>선택 영역을 드래그해서 이동하고, 모서리와 변을 잡아 자를 규격을 조절하세요.</div>
            </div>
          </div>
        </div>
      )}

      {renderUpdateRefreshPrompt()}
      {renderActionLoading()}

      {/* TOAST */}
      {toast&&(
        <div style={{position:"absolute" as const,top:122,right:20,background:"#15181D",border:"none",borderRadius:10,padding:"12px 14px",fontSize:12.5,fontWeight:500,color:"#fff",zIndex:99999,display:"flex",alignItems:"center",gap:9,boxShadow:"0 8px 28px -6px rgba(16,24,40,.4)",whiteSpace:"nowrap" as const,animation:`${toastLeaving?"toastOut":"toastIn"} .3s cubic-bezier(.4,0,.2,1) forwards`}}>
          <span style={{width:16,height:16,borderRadius:8,background:toast.ok?A.green:A.red,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,fontWeight:700,color:"#fff"}}>{toast.ok?"✓":"!"}</span><span>{toast.msg}</span>
          {toast.undo&&<button onClick={toast.undo}
            style={{marginLeft:8,padding:"2px 10px",borderRadius:5,border:"none",background:"rgba(255,255,255,.1)",cursor:"pointer",color:"#fff",fontFamily:FONT,fontSize:12,fontWeight:600}}>실행 취소</button>}
        </div>
      )}

    </div>
  )
}
