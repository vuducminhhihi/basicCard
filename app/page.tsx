"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  Heart,
  MapPin,
  Calendar,
  Music,
  MicOffIcon as MusicOff,
  Facebook,
  Instagram,
  MessageCircle,
  Gift,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react"
import Image from "next/image"
// Thêm import cho Google Fonts
import { Roboto, Dancing_Script, Lora } from "next/font/google"
import { useInView as useInViewLib } from "react-intersection-observer"

// Khởi tạo các font (có thể chọn font khác nếu muốn)
const roboto = Roboto({ subsets: ["vietnamese"], weight: ["400", "700"] })
const dancingScript = Dancing_Script({ subsets: ["vietnamese"], weight: ["400", "700"] })
const lora = Lora({ subsets: ["vietnamese"], weight: ["400", "700"] })

// ==== Configurable constants for reuse ====
const COUPLE = {
  groom: { name: "Đức Hải", birth: "1995", job: "Kỹ sư", hobby: "Đọc sách, du lịch", img: "/anh2.jpg" },
  bride: { name: "Thanh Huyền", birth: "1997", job: "Giáo viên", hobby: "Nấu ăn, yoga", img: "/anh1.jpg" },
}
const PARENTS = {
  groom: [
    { label: "ÔNG PHẠM VĂN MINH" },
    { label: "BÀ TRẦN THỊ LAN" },
    { label: "Quận Ba Đình, Hà Nội" },
  ],
  bride: [
    { label: "ÔNG NGUYỄN VĂN LONG" },
    { label: "BÀ LÊ THỊ HƯƠNG" },
    { label: "Quận Cầu Giấy, Hà Nội" },
  ],

}
const WEDDING_DATE = new Date("2025-08-15T10:00:00")
const WEDDING_DAY = 15
const VENUE = {
  name: "The ADORA Center",
  address: "xxx, Phường xxx, Quận xxx,\nHồ Chí Minh",
  mapUrl: "https://maps.google.com/?q=The+ADORA+Center+Ho+Chi+Minh",
  mapImg: "/venue-map.png",
}
// const GALLERY_IMAGES = Array(8).fill("/placeholder.svg?height=400&width=300")
const GALLERY_IMAGES = [
  '/anh10.jpg',
  '/anh11.jpg',
  '/anh12.jpg',
  '/anh9.jpg',
  '/anh13.jpg',
  '/anh7.jpg',

]
const SOCIALS = [
  { icon: Facebook, url: "https://facebook.com", color: "text-blue-600", hover: "hover:bg-blue-50" },
  { icon: MessageCircle, url: "https://zalo.me", color: "text-blue-500", hover: "hover:bg-blue-50" },
  { icon: Instagram, url: "https://instagram.com", color: "text-pink-600", hover: "hover:bg-pink-50" },
]

// ==== Helper Components ====
function SocialButton({ icon: Icon, url, color, hover }: any) {
  return (
    <Button
      variant="outline"
      size="lg"
      className={`w-12 h-12 rounded-full border-gray-300 bg-transparent transform transition-all duration-300 hover:scale-125 ${hover}`}
      onClick={() => window.open(url, "_blank")}
    >
      <Icon className={`w-5 h-5 ${color}`} />
    </Button>
  )
}

// Thêm CSS animation inline (hoặc tách file nếu muốn)
const animationStyles = `
@keyframes slideInLeft { from { opacity:0; transform:translateX(-60px);} to {opacity:1; transform:translateX(0);} }
@keyframes slideInRight { from { opacity:0; transform:translateX(60px);} to {opacity:1; transform:translateX(0);} }
.animate-from-left { animation: slideInLeft 3s cubic-bezier(0.4,0,0.2,1); }
.animate-from-right { animation: slideInRight 3s cubic-bezier(0.4,0,0.2,1); }
`;

// Thêm hiệu ứng tuyết rơi (Snowfall) và animation trượt cho các section chính

const snowStyles = `
.snowflake {
  position: fixed;
  top: -2rem;
  color: #fff;
  font-size: 1.2rem;
  opacity: 0.7;
  pointer-events: none;
  z-index: 9999;
  animation: snowFall linear infinite;
}
@keyframes snowFall {
  0% { transform: translateY(-2rem) translateX(0); opacity: 0.7;}
  90% { opacity: 0.7;}
  100% { transform: translateY(110vh) translateX(var(--snow-x, 0px)); opacity: 0;}
}
.section-animate {
  opacity: 0;
  transform: translateY(60px);
  transition: all 1s cubic-bezier(.4,0,.2,1);
}
.section-animate.in-view {
  opacity: 1;
  transform: translateY(0);
}
`;

// Snowfall component
function Snowfall({ count = 30 }: { count?: number }) {
  // Randomize snowflake positions and delays
  return (
    <>
      {[...Array(count)].map((_, i) => {
        const left = Math.random() * 100;
        const duration = 6 + Math.random() * 6;
        const delay = Math.random() * 6;
        const x = (Math.random() - 0.5) * 100; // random horizontal drift
        return (
          <span
            key={i}
            className="snowflake"
            style={{
              left: `${left}vw`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              // @ts-ignore
              ['--snow-x' as any]: `${x}px`,
            }}
          >
            ❄
          </span>
        );
      })}
    </>
  );
}

// ==== Main Component ====
export default function WeddingInvitation() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [flippedCard, setFlippedCard] = useState<"bride" | "groom" | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [showThankYou, setShowThankYou] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    wishes: "",
    attendance: "",
  })
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = WEDDING_DATE.getTime() - now
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause()
      else audioRef.current.play()
      setIsPlaying(!isPlaying)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setShowThankYou(true)
    setFormData({ name: "", relationship: "", wishes: "", attendance: "" })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Intersection Observer cho các section chính
  const { ref: coupleRef, inView: coupleInView } = useInViewLib({ triggerOnce: true, threshold: 0.2 });
  const { ref: inviteRef, inView: inviteInView } = useInViewLib({ triggerOnce: true, threshold: 0.2 });
  const { ref: calendarRef, inView: calendarInView } = useInViewLib({ triggerOnce: true, threshold: 0.2 });
  const { ref: venueRef, inView: venueInView } = useInViewLib({ triggerOnce: true, threshold: 0.2 });
  const { ref: galleryRef, inView: galleryInView } = useInViewLib({ triggerOnce: true, threshold: 0.2 });
  const { ref: thanksRef, inView: thanksInView } = useInViewLib({ triggerOnce: true, threshold: 0.2 });

  // ==== Render ====
  return (
    <div className={`min-h-screen bg-white relative ${roboto.className}`}>
      {/* Inject animation styles */}
      <style>{animationStyles}</style>
      <style>{snowStyles}</style>
      <Snowfall count={24} />
      {/* Header Section (Always visible, sticky) */}
      <section className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-center py-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <span className={`text-2xl ${dancingScript.className}`}>{COUPLE.groom.name}</span>
              <Heart className="w-4 h-4 text-red-400" />
              <span className={`text-2xl ${dancingScript.className}`}>{COUPLE.bride.name}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Audio */}
      <audio ref={audioRef} loop>
        <source src="/wedding-music.mp3" type="audio/mpeg" />
      </audio>

      {/* Music Toggle */}
      <Button
        onClick={toggleMusic}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-110"
        variant="ghost"
      >
        {isPlaying ? <Music className="w-5 h-5 text-gray-700" /> : <MusicOff className="w-5 h-5 text-gray-700" />}
      </Button>

      {/* Main Content */}
      <div>
        {/* Video Section */}
        <section className="h-screen w-full flex items-center justify-center bg-white relative">
          <div className="w-full h-full max-w-md mx-auto flex items-center justify-center">
            <div className="w-full h-full max-h-screen bg-black relative">
              <video
                className="w-full h-full object-cover aspect-[9/16]"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                poster="/placeholder.svg?height=640&width=360"
              >
                <source src="/videoWedding.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>

        {/* Couple Section với animation */}
        <section
          ref={coupleRef}
          className={`flex items-center justify-center px-4 pt-0 bg-white section-animate${coupleInView ? " in-view" : ""}`}
          style={{ transitionDelay: '0.2s' }}
        >
          <div className="w-full max-w-sm mx-auto text-center">
            <div className="mb-8 py-4">
              <p className={`text-gray-600 italic mb-2 ${lora.className}`}>Gặp nhau là chuyện do trời,</p>
              <p className={`text-gray-600 italic ${lora.className}`}>Yêu nhau, cưới được – cả đời an yên.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className={`text-center transform transition-all duration-500 hover:scale-105 ${coupleInView ? "animate-from-left" : "opacity-0"}`}>
                <p className="text-sm text-gray-600 mb-1">NHÀ TRAI</p>
                {PARENTS.groom.map((p, i) => (
                  <p key={i} className="text-xs text-gray-500 mb-1 last:mb-0">{p.label}</p>
                ))}
              </div>
              <div className={`text-center transform transition-all duration-500 hover:scale-105 ${coupleInView ? "animate-from-right" : "opacity-0"}`}>
                <p className="text-sm text-gray-600 mb-1">NHÀ GÁI</p>
                {PARENTS.bride.map((p, i) => (
                  <p key={i} className="text-xs text-gray-500 mb-1 last:mb-0">{p.label}</p>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center mb-8">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Groom Card */}
              <div className={`text-center ${coupleInView ? "animate-from-left" : "opacity-0"}`}>
                <p className={`text-lg text-gray-700 mb-2 ${roboto.className}`}>Chú Rể</p>
                <p className={`text-2xl mb-4 ${dancingScript.className} text-gray-800`}>{COUPLE.groom.name}</p>
                <div
                  className="relative w-full aspect-[3/4] cursor-pointer"
                  onClick={() => setFlippedCard(flippedCard === "groom" ? null : "groom")}
                >
                  <div
                    className={`transition-transform duration-700 w-full h-full relative rounded-lg ${flippedCard === "groom" ? "rotate-y-180" : ""}`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden backface-hidden">
                      <Image
                        src={COUPLE.groom.img + "?height=300&width=225"}
                        alt="Chú rể"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden backface-hidden rotate-y-180 bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex flex-col justify-center text-sm">
                      <p className="font-semibold mb-2">{COUPLE.groom.name}</p>
                      <p className="text-gray-600 mb-1">Sinh năm: {COUPLE.groom.birth}</p>
                      <p className="text-gray-600 mb-1">Nghề nghiệp: {COUPLE.groom.job}</p>
                      <p className="text-gray-600">Sở thích: {COUPLE.groom.hobby}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bride Card */}
              <div className={`text-center ${coupleInView ? "animate-from-right" : "opacity-0"}`}>
                <p className={`text-lg text-gray-700 mb-2 ${roboto.className}`}>Cô Dâu</p>
                <p className={`text-2xl mb-4 ${dancingScript.className} text-gray-800`}>{COUPLE.bride.name}</p>
                <div
                  className="relative w-full aspect-[3/4] cursor-pointer"
                  onClick={() => setFlippedCard(flippedCard === "bride" ? null : "bride")}
                >
                  <div
                    className={`transition-transform duration-700 w-full h-full relative rounded-lg ${flippedCard === "bride" ? "rotate-y-180" : ""}`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden backface-hidden">
                      <Image
                        src={COUPLE.bride.img + "?height=300&width=225"}
                        alt="Cô dâu"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 rounded-lg overflow-hidden backface-hidden rotate-y-180 bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex flex-col justify-center text-sm">
                      <p className="font-semibold mb-2">{COUPLE.bride.name}</p>
                      <p className="text-gray-600 mb-1">Sinh năm: {COUPLE.bride.birth}</p>
                      <p className="text-gray-600 mb-1">Nghề nghiệp: {COUPLE.bride.job}</p>
                      <p className="text-gray-600">Sở thích: {COUPLE.bride.hobby}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Thêm Invitation Section trước Calendar Section */}
        <section ref={inviteRef} className={`w-full flex flex-col items-center justify-center py-5 bg-white section-animate${inviteInView ? " in-view" : ""}`}>
          <h2 className={`text-3xl mb-2 font-bold text-gray-800 ${dancingScript.className}`}>Thư Mời</h2>
          <div className="text-base text-gray-600 mb-6 tracking-widest">THAM DỰ LỄ CƯỚI</div>
          <div className="flex gap-2 justify-center">
            {[7, 8, 6].map((num, idx) => (
              <div
                key={num}
                className="relative aspect-[9/16] w-32 sm:w-36 rounded-xl overflow-hidden shadow-lg border border-gray-100 transition-transform duration-300 hover:scale-105"
                style={{ minWidth: 0 }}
              >
                <Image
                  src={`/anh${num}.jpg`}
                  alt={`Ảnh ${num}`}
                  fill
                  className="object-cover w-full h-full"
                  sizes="(max-width: 640px) 128px, 144px"
                  priority={idx === 1}
                />
              </div>
            ))}
          </div>
        </section>
        {/* Calendar Section */}
        <section ref={calendarRef} className={`px-4 bg-white section-animate${calendarInView ? " in-view" : ""}`}>
          <div className="w-full max-w-md mx-auto text-center">
            <div className="mb-8">
              {/* <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" /> */}
              <h2 className={`text-3xl mb-2 font-bold text-gray-800 ${dancingScript.className}`}>Lịch Cưới</h2>
              <p className="text-gray-600">Chúng tôi rất hân hạnh được đón tiếp quý khách</p>
            </div>

            {/* Calendar Widget */}
            <Card className="mb-8 transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">THÁNG 8/2025</h3>

                  {/* Calendar Grid */}
                  <div className="bg-white rounded-lg p-4">
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"].map((day, index) => (
                        <div key={index} className="text-xs text-gray-500 p-2 text-center font-medium">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar dates */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Empty cells for start of month */}
                      {[...Array(6)].map((_, index) => (
                        <div key={`empty-${index}`} className="p-2"></div>
                      ))}

                      {/* Dates */}
                      {[...Array(31)].map((_, index) => {
                        const date = index + 1;
                        const isWeddingDay = date === WEDDING_DAY;
                        return (
                          <div
                            key={date}
                            className={`p-2 text-sm text-center rounded-full transition-all duration-300 ${isWeddingDay
                              ? "bg-red-400 text-white font-bold"
                              : "text-gray-600 hover:bg-gray-100"
                              }`}
                          >
                            {date}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Ngày cưới: <span className="font-semibold text-red-400">15/08/2025</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Thời gian: <span className="font-semibold">10:00 AM</span>
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="text-sm text-gray-600 mb-4">Thời gian còn lại:</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {(["days", "hours", "minutes", "seconds"] as const).map((unit, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 transform transition-all duration-300 hover:scale-110"
                      >
                        <p className="text-xl font-bold text-gray-800">{timeLeft[unit]}</p>
                        <p className="text-xs text-gray-600">
                          {{
                            days: "Ngày",
                            hours: "Giờ",
                            minutes: "Phút",
                            seconds: "Giây",
                          }[unit]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* Venue Section */}
        <section ref={venueRef} className={`min-h-screen flex items-center justify-center px-4 bg-white section-animate${venueInView ? " in-view" : ""}`}>
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <MapPin className="w-14 h-14 text-pink-400 mx-auto mb-4 drop-shadow" />
              <h2 className={`text-3xl mb-2 font-bold text-gray-800 ${dancingScript.className}`}>Địa Điểm Tổ Chức</h2>
              <div className="mt-2 text-base text-gray-700 font-medium">
                The Ahihi Center
              </div>
              <div className="mt-1 text-sm text-gray-600 whitespace-pre-line font-serif">
                Ngách 20, Đường Mỹ Đình, Quận Nam Từ Liêm, Hà Nội
              </div>
            </div>

            <Card className="mb-8 shadow-xl border-0 bg-white/90">
              <CardContent className="p-0 rounded-xl overflow-hidden">
                <div className="aspect-video w-full rounded-t-xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps?q=Ngách+20+Đường+Mỹ+Đình+Nam+Từ+Liêm+Hà+Nội&output=embed"
                    width="100%"
                    height="100%"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full border-0"
                    title="Bản đồ địa điểm"
                  ></iframe>
                </div>
                <div className="p-6 text-center">
                  <div className="mb-2 text-gray-700 font-semibold text-lg">Thời gian tổ chức</div>
                  <div className="mb-4 text-gray-600">10:00 AM, 15/08/2025</div>
                  <div className="mb-2 text-gray-700 font-semibold text-lg">Địa chỉ</div>
                  <div className="mb-4 text-gray-600 whitespace-pre-line">
                    Ngách 20, Đường Mỹ Đình, Quận Nam Từ Liêm, Hà Nội
                  </div>
                </div>
                <div className="text-center mb-2">
                  <Button
                    onClick={() => window.open(VENUE.mapUrl, "_blank")}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-full transform transition-all duration-300 hover:scale-110"
                  >
                    Xem Chi Đường
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 shadow-xl border-0 bg-white/90">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  Xác Nhận Tham Dự
                  <br />
                  <span className="text-base font-normal">&</span>
                  <br />
                  Gửi Lời Chúc
                </h3>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <Input
                    placeholder="Tên của bạn là?"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="transform transition-all duration-300 focus:scale-105"
                    required
                  />
                  <Input
                    placeholder="Bạn là gì của Dâu Rể nhỉ?"
                    value={formData.relationship}
                    onChange={(e) => handleInputChange("relationship", e.target.value)}
                    className="transform transition-all duration-300 focus:scale-105"
                  />
                  <Textarea
                    placeholder="Gửi lời chúc đến Dâu Rể nhé!"
                    rows={3}
                    value={formData.wishes}
                    onChange={(e) => handleInputChange("wishes", e.target.value)}
                    className="transform transition-all duration-300 focus:scale-105"
                  />
                  <Select value={formData.attendance} onValueChange={(value) => handleInputChange("attendance", value)}>
                    <SelectTrigger className="transform transition-all duration-300 focus:scale-105">
                      <SelectValue placeholder="Bạn Có Tham Dự Không?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Có, tôi sẽ tham dự</SelectItem>
                      <SelectItem value="no">Không, tôi không thể tham dự</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white transform transition-all duration-300 hover:scale-105"
                  >
                    GỬI NGAY
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center mb-8">
              <Button
                onClick={() => setShowQR(true)}
                className="bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white px-8 py-3 rounded-full transform transition-all duration-300 hover:scale-110 shadow"
              >
                <Gift className="w-4 h-4 mr-2" />
                GỬI MỪNG CƯỚI
              </Button>
            </div>


          </div>
        </section>

        {/* Gallery Section */}
        <section ref={galleryRef} className={`min-h-screen flex items-center justify-center px-4 py-8 bg-white section-animate${galleryInView ? " in-view" : ""}`}>
          <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-serif text-gray-800 mb-2 ${dancingScript.className}`}>Album Hình Cưới</h2>
              <p className="text-gray-600">Những khoảnh khắc đẹp nhất của chúng tôi</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {GALLERY_IMAGES.map((image, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] bg-white rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all duration-500 transform hover:scale-105 hover:shadow-xl"
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image}
                    alt={`Wedding photo ${index + 1}`}
                    width={150}
                    height={200}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Thanks Section */}
        <section ref={thanksRef} className={`px-4 py-12 bg-white section-animate${thanksInView ? " in-view" : ""}`}>
          <div className="w-full max-w-md mx-auto text-center">
            <div className="mb-10">
              <Heart className="w-16 h-16 text-red-400 mx-auto mb-6" />

              <h2 className={`text-3xl font-serif font-semibold text-gray-800 mb-4 ${dancingScript.className}`}>
                Lời Cảm Ơn
              </h2>

              <p className="text-gray-600 text-base leading-relaxed mb-6">
                Cảm ơn tất cả những người bạn thân yêu đã dành thời gian quý báu để chúc phúc cho đám cưới của chúng tôi.
                Sự hiện diện của các bạn chính là món quà ý nghĩa nhất mà chúng tôi có thể nhận được.
              </p>

              <p className="text-gray-600 italic text-sm">
                Trân trọng,<br />
                Đức Hải & Thanh Huyền

              </p>
            </div>

            <div className="flex justify-center gap-4">
              {SOCIALS.map((s, i) => (
                <SocialButton key={i} {...s} />
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Thank You Popup */}
      <Dialog open={showThankYou} onOpenChange={setShowThankYou}>
        <DialogContent className="max-w-sm mx-auto border-0 bg-gradient-to-br from-pink-50 to-red-50">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className={`text-2xl font-bold text-gray-800 mb-3 ${dancingScript.className}`}>Cảm Ơn Bạn!</h3>
            <p className="text-gray-600 mb-4">Chúng tôi đã nhận được lời xác nhận tham dự và lời chúc của bạn.</p>
            <div className="bg-white/70 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 italic">
                "Sự hiện diện của bạn sẽ làm cho ngày cưới của chúng tôi thêm ý nghĩa và trọn vẹn hơn."
              </p>
            </div>
            <div className="flex justify-center mb-4">
              <Heart className="w-6 h-6 text-red-400 mx-1" />
              <Heart className="w-6 h-6 text-red-400 mx-1" />
              <Heart className="w-6 h-6 text-red-400 mx-1" />
            </div>
            <Button
              onClick={() => setShowThankYou(false)}
              className="bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white px-8 py-2 rounded-full transform transition-all duration-300 hover:scale-105"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-sm mx-auto">
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold mb-4">Mừng Cưới</h3>
            <div className="w-48 h-48 bg-white mx-auto mb-4 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">QR Code</div>
            </div>
            <p className="text-sm text-gray-600">Quét mã QR để gửi mừng cưới</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-sm mx-auto p-0">
          {selectedImage !== null && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
              <Image
                src={GALLERY_IMAGES[selectedImage] || "/placeholder.svg"}
                alt={`Wedding photo ${selectedImage + 1}`}
                width={400}
                height={600}
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 text-white hover:bg-black/70 transform transition-all duration-300 hover:scale-110"
                  onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : GALLERY_IMAGES.length - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 text-white hover:bg-black/70 transform transition-all duration-300 hover:scale-110"
                  onClick={() => setSelectedImage(selectedImage < GALLERY_IMAGES.length - 1 ? selectedImage + 1 : 0)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

