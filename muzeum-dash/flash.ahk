#Requires AutoHotkey v2.0
#SingleInstance Force
Persistent

; =========================================================
; CONFIG
; =========================================================

global CONFIG_FILE := A_ScriptDir "\museum-kiosk.ini"
global CONFIG := Map()

global SUPPORTED_EXT := []
global TEMP_DIR := "C:\MuseumTemp"
global TOUCH_MONITOR := 1
global CONTENT_MONITOR := 2
global VLC_PATH := ""
global SUMATRA_PATH := ""

; =========================================================
; STATE
; =========================================================

global g_LastDrives := Map()

global g_Busy := false
global g_Running := false
global g_Mode := ""          ; "ppt" | "pdf" | "video" | ""

global g_FileList := []
global g_CurrentIndex := 0
global g_LocalFile := ""

global g_PPTApp := ""
global g_Presentation := ""
global g_PPTPid := 0
global g_PlayerPid := 0

global g_SelectedFile := ""
global g_CurrentDrive := ""

global g_ControlGui := ""
global g_ControlListView := ""
global g_ControlModeLabel := ""
global g_ControlSlideLabel := ""
global g_PptPrevBtn := ""
global g_PptNextBtn := ""

; =========================================================
; INIT
; =========================================================

LoadConfig()
ValidateMonitors()

if !DirExist(TEMP_DIR)
    DirCreate(TEMP_DIR)

InitDriveSnapshot()

SetTimer ScanUSB, 1000

Log("KIOSK STARTED (TouchMonitor=" TOUCH_MONITOR ", ContentMonitor=" CONTENT_MONITOR ")")

; =========================================================
; CONFIG MODULE
; =========================================================

LoadConfig() {
    global CONFIG_FILE, CONFIG, SUPPORTED_EXT, TEMP_DIR
    global TOUCH_MONITOR, CONTENT_MONITOR, VLC_PATH, SUMATRA_PATH

    defaults := Map(
        "TouchMonitor", "1",
        "ContentMonitor", "2",
        "TempDir", "C:\MuseumTemp",
        "VLCPath", "C:\Program Files\VideoLAN\VLC\vlc.exe",
        "SumatraPath", "C:\Program Files\SumatraPDF\SumatraPDF.exe",
        "SupportedExt", "pptx,ppt,pdf,mp4,webm,mkv,avi"
    )

    if !FileExist(CONFIG_FILE) {
        for key, val in defaults
            IniWrite val, CONFIG_FILE, "Kiosk", key
    }

    CONFIG := Map()
    for key, defaultVal in defaults {
        val := IniRead(CONFIG_FILE, "Kiosk", key, defaultVal)
        CONFIG[key] := val
    }

    TOUCH_MONITOR := Integer(CONFIG["TouchMonitor"])
    CONTENT_MONITOR := Integer(CONFIG["ContentMonitor"])
    TEMP_DIR := CONFIG["TempDir"]
    VLC_PATH := CONFIG["VLCPath"]
    SUMATRA_PATH := CONFIG["SumatraPath"]

    SUPPORTED_EXT := []
    for ext in StrSplit(CONFIG["SupportedExt"], ",")
        SUPPORTED_EXT.Push(Trim(ext, " `t`r`n"))
}

SaveMonitorConfig(touch, content) {
    global CONFIG_FILE, TOUCH_MONITOR, CONTENT_MONITOR, CONFIG

    TOUCH_MONITOR := touch
    CONTENT_MONITOR := content
    CONFIG["TouchMonitor"] := String(touch)
    CONFIG["ContentMonitor"] := String(content)

    IniWrite String(touch), CONFIG_FILE, "Kiosk", "TouchMonitor"
    IniWrite String(content), CONFIG_FILE, "Kiosk", "ContentMonitor"
}

ValidateMonitors() {
    count := MonitorGetCount()

    if (TOUCH_MONITOR < 1 || TOUCH_MONITOR > count || CONTENT_MONITOR < 1 || CONTENT_MONITOR > count) {
        Log("Invalid monitor config (Touch=" TOUCH_MONITOR ", Content=" CONTENT_MONITOR ", Count=" count ")")

        if count < 2 {
            MsgBox "Обнаружен только один монитор.`nTouchMonitor=1, ContentMonitor=1 будут использованы по умолчанию.", "Museum Kiosk", "Icon!"
            SaveMonitorConfig(1, 1)
            return
        }

        selected := ShowMonitorPicker(count)
        if selected {
            SaveMonitorConfig(selected.touch, selected.content)
            Log("Monitors configured: Touch=" selected.touch ", Content=" selected.content)
        } else {
            SaveMonitorConfig(1, 2)
            Log("Monitor picker cancelled — using Touch=1, Content=2")
        }
    }
}

ShowMonitorPicker(count) {
    result := { touch: 0, content: 0, done: false }

    gui := Gui("+AlwaysOnTop", "Настройка мониторов")
    gui.SetFont("s12")

    gui.AddText(, "Выберите монитор для тач-пульта и монитор для контента:")
    gui.AddText("xm y+10", "Touch (пульт):")
    touchDrop := gui.AddDropDownList("xm y+5 w300 Choose1", BuildMonitorChoices(count))
    gui.AddText("xm y+15", "Content (контент):")
    contentDrop := gui.AddDropDownList("xm y+5 w300 Choose" (count >= 2 ? 2 : 1), BuildMonitorChoices(count))

    okBtn := gui.AddButton("xm y+20 w140 h40", "Сохранить")
    okBtn.OnEvent("Click", (*) => (
        result.touch := touchDrop.Value,
        result.content := contentDrop.Value,
        result.done := true,
        gui.Destroy()
    ))

    cancelBtn := gui.AddButton("x+10 yp w140 h40", "По умолчанию")
    cancelBtn.OnEvent("Click", (*) => (
        result.touch := 1,
        result.content := Min(2, count),
        result.done := true,
        gui.Destroy()
    ))

    MoveGuiToMonitor(gui, 1)
    gui.Show("AutoSize Center")

    while WinExist("ahk_id " gui.Hwnd) && !result.done
        Sleep 50

    return result.done ? result : false
}

BuildMonitorChoices(count) {
    choices := []
    Loop count
        choices.Push("Монитор " A_Index)
    return choices
}

; =========================================================
; MONITORS MODULE
; =========================================================

GetMonitorRect(index, &left, &top, &right, &bottom) {
    if !MonitorGet(index, &left, &top, &right, &bottom)
        throw Error("Monitor " index " not found")
}

GetMonitorWorkArea(index, &left, &top, &right, &bottom) {
    if !MonitorGetWorkArea(index, &left, &top, &right, &bottom)
        throw Error("Monitor work area " index " not found")
}

MoveWindowToMonitor(hwnd, monitorIndex) {
    GetMonitorRect(monitorIndex, &left, &top, &right, &bottom)
    WinMove left, top, right - left, bottom - top, "ahk_id " hwnd
}

MoveGuiToMonitor(gui, monitorIndex, width := 0, height := 0) {
    GetMonitorWorkArea(monitorIndex, &left, &top, &right, &bottom)

    if !width
        width := Min(600, right - left - 40)
    if !height
        height := Min(800, bottom - top - 40)

    x := left + (right - left - width) // 2
    y := top + (bottom - top - height) // 2
    gui.Show("x" x " y" y " w" width " h" height)
}

PositionGuiOnMonitor(gui, monitorIndex, width, height) {
    GetMonitorWorkArea(monitorIndex, &left, &top, &right, &bottom)
    x := left + (right - left - width) // 2
    y := top + (bottom - top - height) // 2
    return "x" x " y" y " w" width " h" height
}

; =========================================================
; DRIVE SNAPSHOT
; =========================================================

InitDriveSnapshot() {
    global g_LastDrives
    for d in GetDrives()
        g_LastDrives[d] := true
}

; =========================================================
; USB SCAN
; =========================================================

ScanUSB() {
    global g_LastDrives, g_Busy

    if g_Busy
        return

    current := Map()

    for d in GetDrives()
        current[d] := true

    for drive, _ in current {
        if !g_LastDrives.Has(drive) {
            driveCopy := drive
            SetTimer((*) => OnInsert(driveCopy), -1)
        }
    }

    for drive, _ in g_LastDrives {
        if !current.Has(drive) {
            driveCopy := drive
            SetTimer((*) => OnRemove(driveCopy), -1)
        }
    }

    g_LastDrives := current
}

GetDrives() {
    list := []
    raw := DriveGetList("REMOVABLE")

    Loop Parse raw {
        d := A_LoopField ":"
        if DirExist(d "\")
            list.Push(d)
    }
    return list
}

; =========================================================
; INSERT
; =========================================================

OnInsert(drive) {
    global g_Busy, g_Running, g_CurrentDrive, g_FileList

    if g_Busy
        return

    if g_Running
        return

    g_Busy := true

    try {
        Log("USB INSERT: " drive)

        g_CurrentDrive := drive

        Sleep 1500

        g_FileList := FindFiles(drive)

        if g_FileList.Length = 0 {
            Log("No supported files on " drive)
            return
        }

        selected := (g_FileList.Length = 1) ? g_FileList[1] : ShowPicker(g_FileList)

        if !selected
            return

        g_CurrentIndex := FindFileIndex(selected)
        localFile := CopyToTemp(selected)

        if !localFile
            return

        if !LaunchFile(localFile)
            return

    } finally {
        g_Busy := false
    }
}

; =========================================================
; REMOVE
; =========================================================

OnRemove(drive) {
    global g_Running, g_CurrentDrive

    Log("USB REMOVE: " drive)

    if (g_Running && drive = g_CurrentDrive)
        Stop()

    CleanupTemp()
}

; =========================================================
; FIND FILES
; =========================================================

FindFiles(drive) {
    files := []

    for ext in SUPPORTED_EXT {
        Loop Files drive "\*." ext, "R"
            files.Push(A_LoopFileFullPath)
    }

    SortFilesByName(files)
    return files
}

SortFilesByName(&files) {
    if files.Length <= 1
        return

    names := []
    for file in files {
        SplitPath file, &name
        names.Push(name)
    }
    Sort names, "P"

    sorted := []
    for name in names {
        for file in files {
            SplitPath file, &fileName
            if (fileName = name) {
                sorted.Push(file)
                break
            }
        }
    }

    files.Length := 0
    for file in sorted
        files.Push(file)
}

FindFileIndex(path) {
    global g_FileList
    for i, file in g_FileList
        if (file = path)
            return i
    return 1
}

GetFileMode(path) {
    SplitPath path, , , &ext
    ext := StrLower(ext)

    if (ext = "ppt" || ext = "pptx")
        return "ppt"
    if (ext = "pdf")
        return "pdf"
    if (ext = "mp4" || ext = "webm" || ext = "mkv" || ext = "avi")
        return "video"
    return ""
}

GetFileTypeLabel(path) {
    mode := GetFileMode(path)
    return mode = "ppt" ? "PPT" : mode = "pdf" ? "PDF" : mode = "video" ? "Video" : "?"
}

; =========================================================
; COPY / TEMP
; =========================================================

CopyToTemp(src) {
    global TEMP_DIR

    try {
        SplitPath src, &name
        dest := TEMP_DIR "\" A_Now "_" name
        FileCopy src, dest, true
        return dest
    } catch as e {
        Log("CopyToTemp failed: " e.Message)
        return ""
    }
}

CleanupTemp() {
    global TEMP_DIR

    Loop Files TEMP_DIR "\*.*"
        try FileDelete A_LoopFileFullPath
}

; =========================================================
; FILE PICKER
; =========================================================

ShowPicker(files) {
    global g_SelectedFile

    g_SelectedFile := ""

    pickerGui := Gui("+AlwaysOnTop +ToolWindow", "Выбор файла")

    pickerGui.AddText("xm ym w520 Center", "Выберите файл для показа:")

    y := 40

    for _, file in files {
        SplitPath file, &name
        label := GetFileTypeLabel(file) " — " name

        btn := pickerGui.AddButton("x10 y" y " w520 h44", label)
        btn.OnEvent("Click", SelectFile.Bind(file, pickerGui))

        y += 54
    }

    pickerPos := PositionGuiOnMonitor(pickerGui, TOUCH_MONITOR, 550, y + 10)
    pickerGui.Show(pickerPos)

    hwnd := pickerGui.Hwnd

    while WinExist("ahk_id " hwnd) {
        if g_SelectedFile
            break
        Sleep 50
    }

    return g_SelectedFile
}

SelectFile(file, pickerGui, *) {
    global g_SelectedFile
    g_SelectedFile := file
    try pickerGui.Destroy()
}

; =========================================================
; LAUNCHER
; =========================================================

LaunchFile(path) {
    mode := GetFileMode(path)

    switch mode {
        case "ppt":
            return LaunchPPT(path)
        case "pdf":
            MsgBox "PDF будет доступен в следующей фазе.`nФайл: " path, "Museum Kiosk", "Iconi"
            Log("PDF launch skipped (phase 2): " path)
            return false
        case "video":
            MsgBox "Видео будет доступно в следующей фазе.`nФайл: " path, "Museum Kiosk", "Iconi"
            Log("Video launch skipped (phase 3): " path)
            return false
        default:
            Log("Unknown file type: " path)
            return false
    }
}

SwitchFile(index) {
    global g_FileList, g_CurrentIndex, g_Busy, g_Running

    if g_Busy || !g_Running
        return

    if (index < 1 || index > g_FileList.Length)
        return

    if (index = g_CurrentIndex)
        return

    g_Busy := true

    try {
        prevIndex := g_CurrentIndex
        g_CurrentIndex := index
        sourceFile := g_FileList[index]

        StopCurrent()

        localFile := CopyToTemp(sourceFile)
        if !localFile
            throw Error("Copy failed")

        if !LaunchFile(localFile) {
            g_CurrentIndex := prevIndex
            return
        }
        UpdateControlPanel()

    } catch as e {
        Log("SwitchFile error: " e.Message)
        MsgBox "Ошибка переключения файла:`n" e.Message, "Museum Kiosk", "Icon!"
    } finally {
        g_Busy := false
    }
}

; =========================================================
; POWERPOINT
; =========================================================

LaunchPPT(path) {
    global g_PPTApp, g_Presentation, g_PPTPid, g_PlayerPid
    global g_Running, g_Mode, g_LocalFile

    try {
        StopCurrent()

        ppt := ComObject("PowerPoint.Application")
        ppt.Visible := true
        ppt.DisplayAlerts := 0

        pres := ppt.Presentations.Open(path, false, false, false)

        settings := pres.SlideShowSettings
        settings.LoopUntilStopped := true
        settings.ShowType := 1   ; ppShowTypeWindow — позволяет переместить окно на нужный монитор

        slideShow := settings.Run()

        Sleep 500
        PositionPPTOnContentMonitor()
        SetPPTTopMost()

        g_PPTPid := DetectPPTPid()
        g_PlayerPid := g_PPTPid

        if !g_PPTPid
            throw Error("Cannot detect PowerPoint PID")

        g_PPTApp := ppt
        g_Presentation := pres
        g_LocalFile := path
        g_Mode := "ppt"
        g_Running := true

        ShowControlPanel()
        UpdateControlPanel()
        UpdateSlideIndicator()

        Log("PPT STARTED PID=" g_PPTPid " on monitor " CONTENT_MONITOR)
        return true

    } catch as e {
        Stop("ppt")
        MsgBox "Launch error:`n" e.Message, "Museum Kiosk", "Icon!"
        return false
    }
}

PositionPPTOnContentMonitor() {
    global CONTENT_MONITOR

    GetMonitorRect(CONTENT_MONITOR, &left, &top, &right, &bottom)
    width := right - left
    height := bottom - top

    Loop 20 {
        for hwnd in WinGetList("ahk_exe POWERPNT.EXE") {
            try {
                cls := WinGetClass("ahk_id " hwnd)
                if (cls = "screenClass") {
                    WinMove left, top, width, height, "ahk_id " hwnd
                    WinMaximize "ahk_id " hwnd
                    return
                }
            }
        }
        Sleep 100
    }

    Log("Warning: could not position PPT slideshow on monitor " CONTENT_MONITOR)
}

SetPPTTopMost() {
    for hwnd in WinGetList("ahk_exe POWERPNT.EXE") {
        try {
            cls := WinGetClass("ahk_id " hwnd)
            if (cls = "screenClass") {
                WinSetAlwaysOnTop true, "ahk_id " hwnd
                WinActivate "ahk_id " hwnd
                WinMoveTop "ahk_id " hwnd
            }
        }
    }
}

PPTNext() {
    global g_Presentation, g_Mode

    if (g_Mode != "ppt" || !IsObject(g_Presentation))
        return

    try {
        view := g_Presentation.SlideShowWindow.View
        view.Next()
        UpdateSlideIndicator()
        Log("PPT Next slide")
    } catch as e {
        Log("PPTNext error: " e.Message)
    }
}

PPTPrevious() {
    global g_Presentation, g_Mode

    if (g_Mode != "ppt" || !IsObject(g_Presentation))
        return

    try {
        view := g_Presentation.SlideShowWindow.View
        view.Previous()
        UpdateSlideIndicator()
        Log("PPT Previous slide")
    } catch as e {
        Log("PPTPrevious error: " e.Message)
    }
}

UpdateSlideIndicator() {
    global g_Presentation, g_Mode, g_ControlSlideLabel
    global g_PptPrevBtn, g_PptNextBtn

    if !IsObject(g_ControlSlideLabel)
        return

    showPpt := (g_Mode = "ppt" && IsObject(g_Presentation))

    if IsObject(g_PptPrevBtn)
        g_PptPrevBtn.Visible := showPpt
    if IsObject(g_PptNextBtn)
        g_PptNextBtn.Visible := showPpt

    if !showPpt {
        g_ControlSlideLabel.Text := ""
        return
    }

    try {
        current := g_Presentation.SlideShowWindow.View.CurrentShowPosition
        total := g_Presentation.Slides.Count
        g_ControlSlideLabel.Text := "Слайд " current " / " total
    } catch {
        g_ControlSlideLabel.Text := "Слайд —"
    }
}

DetectPPTPid() {
    for hwnd in WinGetList("ahk_exe POWERPNT.EXE") {
        try
            return WinGetPID("ahk_id " hwnd)
    }
    return 0
}

StopPPT() {
    global g_PPTApp, g_Presentation, g_PPTPid, g_PlayerPid

    Log("STOP PPT")

    try {
        if IsObject(g_Presentation)
            try g_Presentation.Close()
        if IsObject(g_PPTApp)
            try g_PPTApp.Quit()
    }

    Sleep 1500

    if g_PPTPid && ProcessExist(g_PPTPid)
        ProcessClose g_PPTPid

    g_PPTApp := ""
    g_Presentation := ""
    g_PPTPid := 0
    g_PlayerPid := 0
}

; =========================================================
; STOP (unified)
; =========================================================

StopCurrent() {
    global g_Mode
    Stop(g_Mode, false)
}

Stop(mode := "", fullSession := true) {
    global g_Running, g_Mode, g_PlayerPid, g_LocalFile, g_CurrentIndex, g_Presentation

    if !mode
        mode := g_Mode

    Log("STOP mode=" mode " fullSession=" fullSession)

    switch mode {
        case "ppt":
            StopPPT()
        case "pdf":
            StopPDF()
        case "video":
            StopVideo()
        default:
            if (g_Presentation && IsObject(g_Presentation))
                StopPPT()
    }

    g_Mode := ""
    g_PlayerPid := 0
    g_LocalFile := ""

    if fullSession {
        g_Running := false
        g_CurrentIndex := 0
        HideControlPanel()
    } else {
        UpdateSlideIndicator()
    }
}

StopPDF() {
    Log("STOP PDF (stub)")
    ; Phase 2
}

StopVideo() {
    Log("STOP Video (stub)")
    ; Phase 3
}

; =========================================================
; CONTROL PANEL
; =========================================================

ShowControlPanel() {
    global g_ControlGui, g_ControlListView, g_ControlModeLabel
    global g_ControlSlideLabel, g_PptPrevBtn, g_PptNextBtn

    HideControlPanel()

    gui := Gui("+AlwaysOnTop -Caption +ToolWindow", "Museum Control")
    gui.BackColor := "1a1a2e"
    gui.SetFont("s11 cWhite", "Segoe UI")

    g_ControlModeLabel := gui.AddText("xm ym w560 Center cWhite", "Режим: —")
    g_ControlModeLabel.SetFont("s12 bold")

    g_ControlSlideLabel := gui.AddText("xm y+8 w560 Center cCCCCCC", "")

    g_PptPrevBtn := gui.AddButton("xm y+12 w170 h52", "◀ Пред.")
    g_PptPrevBtn.OnEvent("Click", (*) => PPTPrevious())
    g_PptNextBtn := gui.AddButton("x+10 yp w170 h52", "След. ▶")
    g_PptNextBtn.OnEvent("Click", (*) => PPTNext())

    gui.AddText("xm y+16 w560", "Файлы на флешке:")
    g_ControlListView := gui.AddListView("xm y+6 w560 h220 -Multi", ["Тип", "Имя файла"])
    g_ControlListView.OnEvent("DoubleClick", OnControlFileActivate)

    stopBtn := gui.AddButton("xm y+12 w560 h56", "■ Стоп / закрыть")
    stopBtn.SetFont("s12 bold")
    stopBtn.OnEvent("Click", (*) => OnControlStop())

    g_ControlGui := gui
    PopulateControlFileList()
    UpdateControlPanel()

    MoveGuiToMonitor(gui, TOUCH_MONITOR, 580, 460)
}

HideControlPanel() {
    global g_ControlGui, g_ControlListView, g_ControlModeLabel
    global g_ControlSlideLabel, g_PptPrevBtn, g_PptNextBtn

    if IsObject(g_ControlGui) {
        try g_ControlGui.Destroy()
    }

    g_ControlGui := ""
    g_ControlListView := ""
    g_ControlModeLabel := ""
    g_ControlSlideLabel := ""
    g_PptPrevBtn := ""
    g_PptNextBtn := ""
}

PopulateControlFileList() {
    global g_FileList, g_ControlListView, g_CurrentIndex

    if !IsObject(g_ControlListView)
        return

    g_ControlListView.Delete()

    for i, file in g_FileList {
        SplitPath file, &name
        typeLabel := GetFileTypeLabel(file)
        g_ControlListView.Add("", typeLabel, name)

        if (i = g_CurrentIndex)
            g_ControlListView.Modify(i, "Select Focus")
    }
}

UpdateControlPanel() {
    global g_Mode, g_ControlModeLabel, g_FileList, g_CurrentIndex

    if !IsObject(g_ControlModeLabel)
        return

    modeLabel := g_Mode = "ppt" ? "PowerPoint"
        : g_Mode = "pdf" ? "PDF"
        : g_Mode = "video" ? "Видео"
        : "—"

    currentName := ""
    if (g_CurrentIndex >= 1 && g_CurrentIndex <= g_FileList.Length) {
        SplitPath g_FileList[g_CurrentIndex], &currentName
    }

    g_ControlModeLabel.Text := "Режим: " modeLabel
    if currentName
        g_ControlModeLabel.Text .= " — " currentName

    PopulateControlFileList()
    UpdateSlideIndicator()
}

OnControlFileActivate(*) {
    global g_ControlListView

    row := g_ControlListView.GetNext(0, "F")
    if row
        SwitchFile(row)
}

OnControlStop() {
    global g_Running, g_CurrentDrive

    if g_Running
        Stop()

    CleanupTemp()
    g_CurrentDrive := ""
    Log("Control panel stop")
}

; =========================================================
; LOG
; =========================================================

Log(msg) {
    FileAppend "[" FormatTime(, "HH:mm:ss") "] " msg "`n", A_ScriptDir "\kiosk.log"
}
