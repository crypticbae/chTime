import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { WorkDay, UserSettings } from './database'
import { Language, getTranslations } from './i18n'

export interface PDFExportOptions {
  title: string
  dateRange?: {
    start: Date
    end: Date
  }
  workDays: WorkDay[]
  settings: UserSettings
  summaryData?: any
  language: Language
}

export class PDFExporter {
  private static formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins.toString().padStart(2, '0')}m`
  }

  private static formatDate(date: Date | string, timezone: string, language: Language = 'de'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  private static formatDateTime(date: Date | string, timezone: string, language: Language = 'de'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleString(language === 'de' ? 'de-DE' : 'en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  static async exportDayReport(workDay: WorkDay | null, selectedDate: Date, settings: UserSettings, language: Language = 'de'): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const t = getTranslations(language)
    
    // Header with gradient background
    pdf.setFillColor(59, 130, 246) // Primary blue
    pdf.rect(0, 0, 210, 40, 'F')
    
    // Header text
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text(t.pdfDayReportTitle, 20, 15)
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(this.formatDate(selectedDate, settings.timezone, language), 20, 25)
    
    // Reset colors
    pdf.setTextColor(0, 0, 0)
    
    let yPosition = 50
    
    if (workDay && workDay.entries.length > 0) {
      // Summary statistics
      const targetMinutes = settings.workHoursTarget * 60
      const progress = (workDay.totalWorkTime / targetMinutes) * 100
      
      // Statistics cards
      const stats = [
              { label: t.pdfWorkTime, value: this.formatTime(workDay.totalWorkTime), color: [59, 130, 246] },
      { label: t.pdfBreakTime, value: this.formatTime(workDay.totalBreakTime), color: [245, 158, 11] },
      { label: t.pdfTargetTime, value: this.formatTime(targetMinutes), color: [34, 197, 94] },
        { label: t.pdfProgress, value: `${Math.round(progress)}%`, color: [168, 85, 247] },
      ]
      
      // Draw statistics cards in a 2x2 grid
      const cardWidth = 85
      const cardHeight = 25
      const cardSpacing = 10
      
      stats.forEach((stat, index) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        const x = 20 + col * (cardWidth + cardSpacing)
        const y = yPosition + row * (cardHeight + cardSpacing)
        
        // Card background
        pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2])
        pdf.rect(x, y, cardWidth, cardHeight, 'F')
        
        // Card text
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text(stat.label, x + 5, y + 8)
        
        pdf.setFontSize(14)
        pdf.text(stat.value, x + 5, y + 18)
      })
      
      yPosition += 65
      
      // Activities section
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(t.pdfTimeActivities, 20, yPosition)
      
      yPosition += 15
      
      // Sort entries by timestamp
      const sortedEntries = [...workDay.entries].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      
      // Create table for entries
      pdf.setFontSize(10)
      
      // Table headers
      pdf.setFillColor(240, 240, 240)
      pdf.rect(20, yPosition, 170, 8, 'F')
      pdf.setFont('helvetica', 'bold')
                      pdf.text(t.pdfTime, 25, yPosition + 5)
        pdf.text(t.pdfActivity, 70, yPosition + 5)
        pdf.text(t.pdfStatus, 140, yPosition + 5)
      
      yPosition += 10
      
      sortedEntries.forEach((entry, index) => {
        const entryDate = new Date(entry.timestamp)
        
        let activityText = ''
        let icon = ''
        
        switch (entry.type) {
          case 'clock-in':
            activityText = t.pdfWorkStart
            icon = '[IN]'
            break
          case 'clock-out':
            activityText = t.pdfWorkEnd
            icon = '[OUT]'
            break
          case 'break-start':
            activityText = 'Pause begonnen'
            icon = '[PAUSE]'
            break
          case 'break-end':
            activityText = 'Pause beendet'
            icon = '[ZURÜCK]'
            break
        }
        
        // Alternating row colors
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250)
          pdf.rect(20, yPosition - 2, 170, 8, 'F')
        }
        
        pdf.setFont('helvetica', 'normal')
        pdf.text(this.formatDateTime(entryDate, settings.timezone, language), 25, yPosition + 3)
        pdf.text(activityText, 70, yPosition + 3)
        pdf.text(icon, 140, yPosition + 3)
        
        yPosition += 8
        
        // Check for page break
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 20
        }
      })
    } else {
      // No activities message
      pdf.setFillColor(255, 249, 196)
      pdf.rect(20, yPosition, 170, 30, 'F')
      
      pdf.setTextColor(146, 64, 14)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('[INFO] Keine Aktivitäten', 25, yPosition + 15)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
              pdf.text(t.pdfNoTimeEntriesFound, 25, yPosition + 25)
    }
    
    // Footer
    const pageHeight = pdf.internal.pageSize.height
    pdf.setFillColor(30, 41, 59)
    pdf.rect(0, pageHeight - 20, 210, 20, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.text('Powered by chTime', 20, pageHeight - 10)
    pdf.text(`${t.pdfGeneratedOn}: ${new Date().toLocaleString(language === 'de' ? 'de-DE' : 'en-US')}`, 20, pageHeight - 5)
    pdf.text('Seite 1', 180, pageHeight - 10)
    
    // Download PDF
    const fileName = `chTime_Tagesbericht_${selectedDate.toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
  }

  static async exportRangeReport(options: PDFExportOptions): Promise<void> {
    const { title, dateRange, workDays, settings, summaryData, language } = options
    const t = getTranslations(language)
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // Header with gradient background
    pdf.setFillColor(168, 85, 247) // Purple theme for range reports
    pdf.rect(0, 0, 210, 40, 'F')
    
    // Header text
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text(t.pdfRangeReportTitle, 20, 15)
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    if (dateRange) {
      pdf.text(`${this.formatDate(dateRange.start, settings.timezone, language)} - ${this.formatDate(dateRange.end, settings.timezone, language)}`, 20, 25)
    }
    
    // Reset colors
    pdf.setTextColor(0, 0, 0)
    
    let yPosition = 50
    
    if (summaryData) {
      // Summary statistics
      const stats = [
              { label: t.pdfTotalWorkTime, value: this.formatTime(summaryData.totalWorkTime), color: [59, 130, 246] },
      { label: t.pdfTotalBreakTime, value: this.formatTime(summaryData.totalBreakTime), color: [245, 158, 11] },
      { label: t.pdfWorkDays, value: `${summaryData.workingDays}`, color: [34, 197, 94] },
      { label: t.pdfAveragePerWorkDay, value: this.formatTime(Math.round(summaryData.totalWorkTime / Math.max(summaryData.workingDays, 1))), color: [168, 85, 247] },
      ]
      
      // Draw statistics cards in a 2x2 grid
      const cardWidth = 85
      const cardHeight = 25
      const cardSpacing = 10
      
      stats.forEach((stat, index) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        const x = 20 + col * (cardWidth + cardSpacing)
        const y = yPosition + row * (cardHeight + cardSpacing)
        
        // Card background
        pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2])
        pdf.rect(x, y, cardWidth, cardHeight, 'F')
        
        // Card text
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.text(stat.label, x + 5, y + 8)
        
        pdf.setFontSize(14)
        pdf.text(stat.value, x + 5, y + 18)
      })
      
      yPosition += 65
    }
    
    // Daily breakdown section
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
          pdf.text(t.pdfDailyBreakdown, 20, yPosition)
    
    yPosition += 15
    
    if (workDays.length > 0) {
      // Table headers
      pdf.setFontSize(10)
      pdf.setFillColor(240, 240, 240)
      pdf.rect(20, yPosition, 170, 8, 'F')
      pdf.setFont('helvetica', 'bold')
              pdf.text(t.pdfDate, 25, yPosition + 5)
        pdf.text(t.pdfWorkTime, 70, yPosition + 5)
        pdf.text(t.pdfBreakTime, 110, yPosition + 5)
        pdf.text(t.pdfProgress, 150, yPosition + 5)
      
      yPosition += 10
      
      const targetMinutes = settings.workHoursTarget * 60
      
      workDays.forEach((workDay, index) => {
        const dayDate = new Date(workDay.date)
        const progress = (workDay.totalWorkTime / targetMinutes) * 100
        const progressIcon = progress >= 100 ? '[ERFÜLLT]' : progress >= 75 ? '[FAST]' : '[NIEDRIG]'
        
        // Alternating row colors
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250)
          pdf.rect(20, yPosition - 2, 170, 8, 'F')
        }
        
        pdf.setFont('helvetica', 'normal')
        pdf.text(this.formatDate(dayDate, settings.timezone, language).split(',')[0], 25, yPosition + 3) // Only date part
        pdf.text(this.formatTime(workDay.totalWorkTime), 70, yPosition + 3)
        pdf.text(this.formatTime(workDay.totalBreakTime), 110, yPosition + 3)
        pdf.text(`${Math.round(progress)}% ${progressIcon}`, 150, yPosition + 3)
        
        yPosition += 8
        
        // Check for page break
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 20
          
          // Repeat headers on new page
          pdf.setFillColor(240, 240, 240)
          pdf.rect(20, yPosition, 170, 8, 'F')
          pdf.setFont('helvetica', 'bold')
          pdf.text(t.pdfDate, 25, yPosition + 5)
          pdf.text(t.pdfWorkTime, 70, yPosition + 5)
          pdf.text(t.pdfBreakTime, 110, yPosition + 5)
          pdf.text(t.pdfProgress, 150, yPosition + 5)
          yPosition += 10
        }
      })
    } else {
      // No data message
      pdf.setFillColor(255, 249, 196)
      pdf.rect(20, yPosition, 170, 30, 'F')
      
      pdf.setTextColor(146, 64, 14)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('[INFO] Keine Daten', 25, yPosition + 15)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(t.pdfNoWorkTimesFound, 25, yPosition + 25)
    }
    
    // Footer
    const pageHeight = pdf.internal.pageSize.height
    pdf.setFillColor(30, 41, 59)
    pdf.rect(0, pageHeight - 20, 210, 20, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.text('Powered by chTime', 20, pageHeight - 10)
    pdf.text(`${t.pdfGeneratedOn}: ${new Date().toLocaleString(language === 'de' ? 'de-DE' : 'en-US')}`, 20, pageHeight - 5)
    pdf.text('Seite 1', 180, pageHeight - 10)
    
    // Download PDF
    const startDate = dateRange?.start ? dateRange.start.toISOString().split('T')[0] : 'unbekannt'
    const endDate = dateRange?.end ? dateRange.end.toISOString().split('T')[0] : 'unbekannt'
    const fileName = `chTime_Zeitspannen-Bericht_${startDate}_bis_${endDate}.pdf`
    pdf.save(fileName)
  }
} 