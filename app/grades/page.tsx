"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSubjectGrades, getRadarChartData } from "@/lib/dashboard-data"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/language-context"
import { RadarChart } from "@/components/ui/radar-chart"
import { SimplePDFExport } from '@/components/pdf/SimplePDFExport'
import Link from 'next/link'

export default function AllGrades() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [grades, setGrades] = useState<Awaited<ReturnType<typeof getSubjectGrades>>>([])
  const [loading, setLoading] = useState(false)
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [radarData, setRadarData] = useState<{ [key: string]: number } | null>(null)
  const [loadingRadar, setLoadingRadar] = useState(false)
  const [selectedCourseName, setSelectedCourseName] = useState<string>('')

  const closeModal = () => {
    setShowModal(false)
    setRadarData(null)
    setSelectedCourseName('')
  }

  useEffect(() => {
    if (user?.isLoggedIn) {
      loadGrades(user.userId)
    }
  }, [user, language])

  async function loadGrades(studentId: string) {
    setLoading(true)
    try {
      // 获取学生信息（年级和专业）
      const { getStudentInfo } = await import('@/lib/dashboard-data')
      const studentInfo = await getStudentInfo(studentId)
      
      // 获取所有成绩
      const allGrades = await getSubjectGrades(studentId, language, studentInfo?.major, studentInfo?.year)
      // 按学分从高到低排序
      const sortedGrades = [...allGrades].sort((a, b) => b.credit - a.credit)
      setGrades(sortedGrades)
    } catch (_error) {
      console.error('Failed to load grades data:', _error)
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = async (index: number) => {
    // 如果点击的是同一行，取消选择并关闭模态框
    if (selectedRow === index) {
      setSelectedRow(null)
      setShowModal(false)
      setRadarData(null)
      setSelectedCourseName('')
      return
    }
    
    // 选择新行
    setSelectedRow(index)
    
    // 如果有课程ID，获取雷达图数据
    if (grades[index]?.course_id) {
      setLoadingRadar(true)
      setShowModal(true)
      setRadarData(null) // 清空之前的数据
      setSelectedCourseName(grades[index].course_name) // 设置课程名称
      try {
        const data = await getRadarChartData(grades[index].course_id!)
        setRadarData(data)
      } catch (_error) {
        console.error('Failed to load radar chart data:', _error)
        setRadarData(null)
      } finally {
        setLoadingRadar(false)
      }
    } else {
      // 没有课程ID时仍然高亮，但不显示模态框
      setShowModal(false)
      setRadarData(null)
      setSelectedCourseName('')
    }
  }

  // 格式化学分为保留一位小数
  const formatCredit = (credit: number): string => {
    return credit.toFixed(1)
  }

  if (!user?.isLoggedIn) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('grades.title')}</h1>
          <p className="text-muted-foreground">{t('grades.login.required')}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('grades.title')}</h1>
          <p className="text-muted-foreground">{t('grades.loading').replace('{name}', user?.name || '')}</p>
        </div>
        <div className="mt-6 flex items-center justify-center h-32">
          <div className="text-muted-foreground">{t('grades.loading.message')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('grades.title')}</h1>
          <p className="text-muted-foreground">{t('grades.description').replace('{name}', user?.name || '')}</p>
        </div>
        <div className="flex items-center gap-2">
          <SimplePDFExport 
            pageTitle="学生成绩单"
            fileName={`${user?.name || 'student'}_grades_${new Date().toISOString().split('T')[0]}.pdf`}
            contentSelector=".grades-content"
          />
          <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            {t('grades.back.to.dashboard')}
          </Link>
        </div>
      </div>

      <div className="grades-content">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{t('grades.all.courses.title')}</CardTitle>
                <CardDescription>{t('grades.all.courses.description')}</CardDescription>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="text-base font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
                  {t('grades.all.courses.click.hint')}
                </div>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">{t('grades.table.course.name')}</th>
                  <th className="py-3 px-4 text-center">{t('grades.table.credit')}</th>
                  <th className="py-3 px-4 text-center">{t('grades.table.score')}</th>
                </tr>
              </thead>
              <tbody>
                {grades.length > 0 ? grades.map((item, index) => (
                  <tr 
                    key={`${item.course_name}-${index}`} 
                    className={`border-b hover:bg-gray-50 cursor-pointer ${selectedRow === index ? '!bg-blue-50' : ''}`}
                    onClick={() => handleRowClick(index)}
                  >
                    <td className="py-3 px-4">{item.course_name}</td>
                    <td className="py-3 px-4 text-center">{formatCredit(item.credit)}</td>
                    <td className="py-3 px-4 text-center">{item.grade}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted-foreground">
                      {t('grades.no.data')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t('grades.total.courses').replace('{count}', grades.length.toString())}
          </div>
        </CardContent>
      </Card>
      </div>

      {/* 悬浮窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedCourseName}</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="flex justify-center">
              {loadingRadar ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-muted-foreground">加载中...</div>
                </div>
              ) : radarData ? (
                <RadarChart data={radarData} width={500} height={500} />
              ) : (
                <div className="flex items-center justify-center h-48">
                  <div className="text-muted-foreground">暂无数据</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 