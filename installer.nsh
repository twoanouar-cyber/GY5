; Custom NSIS installer script for Gym Management System
; Arabic RTL support and professional installer

!include "MUI2.nsh"
!include "FileFunc.nsh"

; Installer settings
!define MUI_ICON "assets\icon.ico"
!define MUI_UNICON "assets\icon.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "assets\header.bmp"
!define MUI_HEADERIMAGE_RIGHT
!define MUI_WELCOMEFINISHPAGE_BITMAP "assets\welcome.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "assets\welcome.bmp"

; RTL support for Arabic
!define MUI_LANGDLL_ALLLANGUAGES

; Welcome page
!define MUI_WELCOMEPAGE_TITLE "مرحباً بك في معالج تثبيت نظام إدارة النادي الرياضي"
!define MUI_WELCOMEPAGE_TEXT "سيقوم هذا المعالج بإرشادك خلال عملية تثبيت نظام إدارة النادي الرياضي.$\r$\n$\r$\nيُنصح بإغلاق جميع التطبيقات الأخرى قبل المتابعة. هذا سيمكن المثبت من تحديث ملفات النظام ذات الصلة دون الحاجة لإعادة تشغيل الكمبيوتر.$\r$\n$\r$\nانقر التالي للمتابعة."

; License page
!define MUI_LICENSEPAGE_TEXT_TOP "يرجى مراجعة اتفاقية الترخيص التالية. يجب قبول شروط هذه الاتفاقية قبل المتابعة مع التثبيت."
!define MUI_LICENSEPAGE_TEXT_BOTTOM "إذا كنت توافق على جميع شروط الاتفاقية، انقر أوافق للمتابعة. يجب أن توافق على الاتفاقية لتثبيت نظام إدارة النادي الرياضي."
!define MUI_LICENSEPAGE_BUTTON "&أوافق"

; Components page
!define MUI_COMPONENTSPAGE_TEXT_TOP "حدد المكونات التي تريد تثبيتها وألغ تحديد المكونات التي لا تريد تثبيتها. انقر التالي للمتابعة."

; Directory page
!define MUI_DIRECTORYPAGE_TEXT_TOP "سيقوم المثبت بتثبيت نظام إدارة النادي الرياضي في المجلد التالي. لتثبيت في مجلد مختلف، انقر استعراض واختر مجلد آخر. انقر التالي للمتابعة."

; Installation page
!define MUI_INSTFILESPAGE_FINISHHEADER_TEXT "اكتمل التثبيت"
!define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT "تم تثبيت نظام إدارة النادي الرياضي بنجاح."

; Finish page
!define MUI_FINISHPAGE_TITLE "اكتمل تثبيت نظام إدارة النادي الرياضي"
!define MUI_FINISHPAGE_TEXT "تم تثبيت نظام إدارة النادي الرياضي على جهاز الكمبيوتر الخاص بك.$\r$\n$\r$\nانقر إنهاء لإغلاق هذا المعالج."
!define MUI_FINISHPAGE_RUN "$INSTDIR\${PRODUCT_NAME}.exe"
!define MUI_FINISHPAGE_RUN_TEXT "تشغيل نظام إدارة النادي الرياضي"
!define MUI_FINISHPAGE_LINK "زيارة موقع الدعم الفني"
!define MUI_FINISHPAGE_LINK_LOCATION "https://support.gym-management.com"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "Arabic"
!insertmacro MUI_LANGUAGE "English"

; Custom functions
Function .onInit
  ; Check if application is already running
  System::Call 'kernel32::CreateMutexA(i 0, i 0, t "GymManagementInstaller") i .r1 ?e'
  Pop $R0
  StrCmp $R0 0 +3
    MessageBox MB_OK|MB_ICONEXCLAMATION "المثبت يعمل بالفعل."
    Abort

  ; Language selection
  !insertmacro MUI_LANGDLL_DISPLAY
FunctionEnd

; Installation sections
Section "الملفات الأساسية" SecMain
  SectionIn RO
  
  SetOutPath "$INSTDIR"
  
  ; Add all application files
  File /r "dist\*.*"
  File /r "electron\*.*"
  File /r "data\*.*"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\نظام إدارة النادي الرياضي"
  CreateShortCut "$SMPROGRAMS\نظام إدارة النادي الرياضي\نظام إدارة النادي الرياضي.lnk" "$INSTDIR\${PRODUCT_NAME}.exe"
  CreateShortCut "$SMPROGRAMS\نظام إدارة النادي الرياضي\إلغاء التثبيت.lnk" "$INSTDIR\Uninstall.exe"
  
  ; Desktop shortcut
  CreateShortCut "$DESKTOP\نظام إدارة النادي الرياضي.lnk" "$INSTDIR\${PRODUCT_NAME}.exe"
  
  ; Write registry keys
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GymManagement" "DisplayName" "نظام إدارة النادي الرياضي"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GymManagement" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GymManagement" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GymManagement" "DisplayIcon" "$INSTDIR\${PRODUCT_NAME}.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GymManagement" "Publisher" "Gym Management Systems"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GymManagement" "DisplayVersion" "${VERSION}"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GymManagement" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GymManagement" "NoRepair" 1
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

Section "قاعدة البيانات النموذجية" SecSampleDB
  SetOutPath "$INSTDIR\data"
  File "data\gym.db"
SectionEnd

Section "دليل المستخدم" SecManual
  SetOutPath "$INSTDIR\docs"
  File "docs\user-manual.pdf"
  CreateShortCut "$SMPROGRAMS\نظام إدارة النادي الرياضي\دليل المستخدم.lnk" "$INSTDIR\docs\user-manual.pdf"
SectionEnd

; Section descriptions
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecMain} "الملفات الأساسية المطلوبة لتشغيل نظام إدارة النادي الرياضي"
  !insertmacro MUI_DESCRIPTION_TEXT ${SecSampleDB} "قاعدة بيانات نموذجية تحتوي على بيانات تجريبية"
  !insertmacro MUI_DESCRIPTION_TEXT ${SecManual} "دليل المستخدم باللغة العربية"
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; Uninstaller section
Section "Uninstall"
  ; Remove files
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  RMDir /r "$SMPROGRAMS\نظام إدارة النادي الرياضي"
  Delete "$DESKTOP\نظام إدارة النادي الرياضي.lnk"
  
  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\GymManagement"
SectionEnd