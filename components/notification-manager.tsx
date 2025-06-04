"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, Calendar, Clock, Check } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function NotificationManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState("default")
  const [showNotificationBanner, setShowNotificationBanner] = useState(false)
  const [countdownNotifications, setCountdownNotifications] = useState({
    oneWeek: true,
    threeDays: true,
    oneDay: true,
    sameDay: true,
  })

  // Check notification permission on mount
  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotificationPermission(Notification.permission)

      if (Notification.permission === "granted") {
        const storedPref = localStorage.getItem("archi-notifications-enabled")
        if (storedPref === "true") {
          setNotificationsEnabled(true)
        }
      }
    }
  }, [])

  // Show notification banner if not decided yet
  useEffect(() => {
    if (notificationPermission === "default") {
      setTimeout(() => {
        setShowNotificationBanner(true)
      }, 5000)
    }
  }, [notificationPermission])

  const requestPermission = async () => {
    if (typeof Notification !== "undefined") {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)

        if (permission === "granted") {
          setNotificationsEnabled(true)
          localStorage.setItem("archi-notifications-enabled", "true")

          // Send test notification
          new Notification("Birthday Countdown Activated!", {
            body: "You'll receive updates as Archi's birthday approaches!",
            icon: "/notification-icon.png",
          })
        }

        setShowNotificationBanner(false)
      } catch (error) {
        console.error("Error requesting notification permission:", error)
      }
    }
  }

  const toggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled)
    localStorage.setItem("archi-notifications-enabled", enabled.toString())

    if (enabled && notificationPermission !== "granted") {
      requestPermission()
    }
  }

  const updateNotificationPreference = (key: keyof typeof countdownNotifications, value: boolean) => {
    setCountdownNotifications((prev) => ({
      ...prev,
      [key]: value,
    }))

    // Save preferences to localStorage
    const currentPrefs = JSON.parse(localStorage.getItem("archi-notification-prefs") || "{}")
    localStorage.setItem(
      "archi-notification-prefs",
      JSON.stringify({
        ...currentPrefs,
        [key]: value,
      }),
    )
  }

  // Schedule notifications based on birthday date
  useEffect(() => {
    if (notificationsEnabled && notificationPermission === "granted") {
      const birthdayDate = new Date("2025-06-04T00:00:00")
      const now = new Date()

      // Calculate time differences
      const oneWeekBefore = new Date(birthdayDate)
      oneWeekBefore.setDate(birthdayDate.getDate() - 7)

      const threeDaysBefore = new Date(birthdayDate)
      threeDaysBefore.setDate(birthdayDate.getDate() - 3)

      const oneDayBefore = new Date(birthdayDate)
      oneDayBefore.setDate(birthdayDate.getDate() - 1)

      // Schedule notifications if time hasn't passed yet
      if (countdownNotifications.oneWeek && now < oneWeekBefore) {
        const timeUntilOneWeek = oneWeekBefore.getTime() - now.getTime()
        setTimeout(() => {
          new Notification("One Week Until Archi's Birthday!", {
            body: "The celebration is getting closer! Just 7 days to go!",
            icon: "/notification-icon.png",
          })
        }, timeUntilOneWeek)
      }

      if (countdownNotifications.threeDays && now < threeDaysBefore) {
        const timeUntilThreeDays = threeDaysBefore.getTime() - now.getTime()
        setTimeout(() => {
          new Notification("3 Days Until Archi's Birthday!", {
            body: "The big day is almost here! Just 3 more days!",
            icon: "/notification-icon.png",
          })
        }, timeUntilThreeDays)
      }

      if (countdownNotifications.oneDay && now < oneDayBefore) {
        const timeUntilOneDay = oneDayBefore.getTime() - now.getTime()
        setTimeout(() => {
          new Notification("Tomorrow is Archi's Birthday!", {
            body: "Get ready for the celebration! Just 1 day to go!",
            icon: "/notification-icon.png",
          })
        }, timeUntilOneDay)
      }

      if (countdownNotifications.sameDay && now < birthdayDate) {
        const timeUntilBirthday = birthdayDate.getTime() - now.getTime()
        setTimeout(() => {
          new Notification("🎉 HAPPY BIRTHDAY ARCHI! 🎉", {
            body: "Today is the big day! Celebrate Archi's 18th birthday!",
            icon: "/notification-icon.png",
          })
        }, timeUntilBirthday)
      }
    }
  }, [notificationsEnabled, notificationPermission, countdownNotifications])

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-68 right-4 md:right-8 z-40 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-full h-12 w-12 flex items-center justify-center shadow-lg shadow-orange-500/20"
      >
        <Bell className="h-5 w-5" />
      </Button>

      {/* Notification Permission Banner */}
      <AnimatePresence>
        {showNotificationBanner && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-black/70 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-4 z-40 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <Bell className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">Birthday Countdown Alerts</h3>
                <p className="text-gray-300 text-sm mb-3">Get notified as Archi's birthday approaches!</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={requestPermission}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg flex-1"
                  >
                    Enable
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNotificationBanner(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg"
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-black/40 backdrop-blur-md border border-yellow-500/30 rounded-3xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Birthday Countdown Alerts
                </h2>
                <p className="text-gray-300">Get notified as the big day approaches!</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notificationsEnabled ? (
                      <Bell className="h-6 w-6 text-yellow-400" />
                    ) : (
                      <BellOff className="h-6 w-6 text-gray-400" />
                    )}
                    <div>
                      <h3 className="text-white font-medium">Notifications</h3>
                      <p className="text-sm text-gray-400">
                        {notificationPermission === "granted"
                          ? "Receive birthday countdown alerts"
                          : "Permission required for notifications"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={toggleNotifications}
                    disabled={notificationPermission === "denied"}
                    className="data-[state=checked]:bg-yellow-500"
                  />
                </div>

                {notificationPermission === "denied" && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-sm text-white">
                    <p>
                      Notifications are blocked by your browser. Please update your browser settings to enable
                      notifications.
                    </p>
                  </div>
                )}

                {notificationsEnabled && notificationPermission === "granted" && (
                  <div className="space-y-4 bg-black/30 rounded-xl p-4 border border-yellow-500/20">
                    <h3 className="text-yellow-300 font-medium">Notification Schedule</h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-yellow-400" />
                          <Label htmlFor="oneWeek" className="text-sm text-gray-300">
                            One week before
                          </Label>
                        </div>
                        <Switch
                          id="oneWeek"
                          checked={countdownNotifications.oneWeek}
                          onCheckedChange={(checked) => updateNotificationPreference("oneWeek", checked)}
                          className="data-[state=checked]:bg-yellow-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-yellow-400" />
                          <Label htmlFor="threeDays" className="text-sm text-gray-300">
                            Three days before
                          </Label>
                        </div>
                        <Switch
                          id="threeDays"
                          checked={countdownNotifications.threeDays}
                          onCheckedChange={(checked) => updateNotificationPreference("threeDays", checked)}
                          className="data-[state=checked]:bg-yellow-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-yellow-400" />
                          <Label htmlFor="oneDay" className="text-sm text-gray-300">
                            One day before
                          </Label>
                        </div>
                        <Switch
                          id="oneDay"
                          checked={countdownNotifications.oneDay}
                          onCheckedChange={(checked) => updateNotificationPreference("oneDay", checked)}
                          className="data-[state=checked]:bg-yellow-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-400" />
                          <Label htmlFor="sameDay" className="text-sm text-gray-300">
                            On birthday (June 4)
                          </Label>
                        </div>
                        <Switch
                          id="sameDay"
                          checked={countdownNotifications.sameDay}
                          onCheckedChange={(checked) => updateNotificationPreference("sameDay", checked)}
                          className="data-[state=checked]:bg-yellow-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={() => {
                          new Notification("Test Notification", {
                            body: "This is a test birthday countdown notification!",
                            icon: "/notification-icon.png",
                          })
                        }}
                        className="w-full bg-gradient-to-r from-yellow-500/50 to-orange-500/50 hover:from-yellow-600/50 hover:to-orange-600/50 text-white rounded-lg"
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Send Test Notification
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl"
                >
                  Save Settings
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
