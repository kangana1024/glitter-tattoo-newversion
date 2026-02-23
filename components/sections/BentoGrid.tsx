import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";

interface BentoItemProps {
  title: string;
  description?: string;
  image?: string;
  href: string;
  className?: string;
  type?: "image-bg" | "solid" | "glass" | "gradient" | "dark";
  contentClassName?: string;
}

function BentoItem({
  title,
  description,
  image,
  href,
  className = "",
  type = "glass",
  contentClassName = "",
}: BentoItemProps) {
  const baseClasses =
    "group relative overflow-hidden rounded-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 block";

  let typeClasses = "";
  if (type === "glass")
    typeClasses =
      "bg-white/70 dark:bg-surface-dark/70 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-lg";
  if (type === "solid")
    typeClasses =
      "bg-surface shadow-lg border border-gray-100 dark:border-white/10";
  if (type === "gradient")
    typeClasses =
      "bg-gradient-to-br from-primary via-accent-pink to-accent-orange text-white shadow-xl";
  if (type === "dark")
    typeClasses =
      "bg-surface-dark dark:bg-black text-white shadow-xl border border-white/10";
  if (type === "image-bg") typeClasses = "shadow-lg bg-black";

  return (
    <Link href={href} className={`${baseClasses} ${typeClasses} ${className}`}>
      {/* Background Image Logic */}
      {image && type === "image-bg" && (
        <>
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        </>
      )}

      {/* Content Wrapper */}
      <div
        className={`relative h-full flex flex-col justify-end p-6 sm:p-8 z-10 ${contentClassName}`}
      >
        {image && type !== "image-bg" && (
          <div className="mb-4 relative h-32 w-full rounded-xl overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <h3
          className={`font-heading text-xl sm:text-2xl font-bold mb-2 ${type === "gradient" || type === "dark" || type === "image-bg" ? "text-white" : "text-text-primary"}`}
        >
          {title}
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2 opacity-0 group-hover:opacity-100">
            →
          </span>
        </h3>
        {description && (
          <p
            className={`font-body text-sm sm:text-base leading-relaxed line-clamp-2 ${type === "gradient" || type === "dark" || type === "image-bg" ? "text-white/80" : "text-text-secondary"}`}
          >
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}

interface BentoGridProps {
  locale: string;
}

export default function BentoGrid({ locale }: BentoGridProps) {
  return (
    <section className="py-20 sm:py-32 bg-surface/50 relative overflow-hidden">
      {/* Abstract Backgrounds */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-40 pointer-events-none animate-float"></div>
      <div className="absolute bottom-20 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] -ml-40 pointer-events-none animate-pulse-slow"></div>

      <Container className="relative z-10">
        <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent pb-2">
          ประสบการณ์แทททูกากเพชรเต็มรูปแบบ
        </h2>
        <p className="text-center font-body text-text-secondary text-lg mb-16 max-w-2xl mx-auto">
          สำรวจบริการ สินค้า และความประทับใจที่เรามอบให้ลูกค้ามายาวนานกว่า 10 ปี
        </p>

        {/* 9-Block Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
          {/* 1. How To Do (Large Hero Block) */}
          <BentoItem
            title="บริการและวิธีการ"
            description="ชมความสนุกสนานและขั้นตอนการเพ้นท์ที่ปลอดภัยสำหรับทุกคนผ่านภาพกิจกรรมจริง"
            href={`/${locale}/services`}
            image="/legacy/images/event/MagicYearInternationalKindergarten/1-1280w.jpg"
            type="image-bg"
            className="md:col-span-2 md:row-span-2"
            contentClassName="justify-end"
          />

          {/* 2. Promotions */}
          <BentoItem
            title="โปรโมชั่นสุดคุ้ม"
            description="เซ็ตสุดคุ้มประจำเดือน พร้อมฟรีค่าจัดส่ง ลดพิเศษเพื่อคุณ"
            href={`/${locale}/promotion`}
            image="/legacy/images/promotion/2016_09/2016_09_01.jpg"
            type="image-bg"
            className="md:col-span-1 md:row-span-2"
          />

          {/* 3. Safety / SGS */}
          <BentoItem
            title="ปลอดสารอันตราย 100%"
            description="มาตรฐาน SGS สากล มั่นใจได้ว่าปลอดภัยต่อผิวเด็ก"
            href={`/${locale}/services`}
            image="/legacy/images/certificate/SGS.png"
            type="glass"
            className="md:col-span-1 md:row-span-1"
          />

          {/* 4. OEM / Manufacturer */}
          <BentoItem
            title="รับผลิตสินค้า OEM"
            description="สร้างแบรนด์กากเพชรแทททูของคุณเอง โดยโรงงานของเรา"
            href={`/${locale}/contact`}
            type="gradient"
            className="md:col-span-1 md:row-span-1"
          />

          {/* 5. Warning / Fake */}
          <BentoItem
            title="วิธีดูของแท้"
            description="ตรวจสอบสินค้าคุณภาพ เพื่อความปลอดภัย"
            href={`/${locale}/services`}
            type="solid"
            className="md:col-span-1 md:row-span-1"
          />

          {/* 6. Gallery & Stencil */}
          <BentoItem
            title="คลังลายสเตนซิล"
            description="เลือกชมลายแฟชั่นอัปเดตใหม่ มากกว่า 200 ลาย"
            href={`/${locale}/gallery`}
            type="image-bg"
            image="/legacy/images/promotion/D1-1280w.jpg"
            className="md:col-span-2 md:row-span-1"
          />

          {/* 7. Reviews */}
          <BentoItem
            title="ภาพความประทับใจ"
            description="รีวิวงานปาร์ตี้และอีเว้นท์ที่ให้เราดูแล"
            href={`/${locale}/gallery`}
            type="image-bg"
            image="/legacy/images/event/MagicYearInternationalKindergarten/12-1280w.jpg"
            className="md:col-span-1 md:row-span-2"
          />

          {/* 8. Business Opportunity */}
          <BentoItem
            title="เปิดร้านแฟรนไชส์"
            description="เริ่มต้นธุรกิจง่ายๆ ลงทุนต่ำ คืนทุนไว พร้อมชุดจัดเต็ม"
            href={`/${locale}/contact`}
            type="image-bg"
            image="/legacy/images/images_newproduct/Pro-a-1280w.png"
            className="md:col-span-2 md:row-span-1"
          />

          {/* 9. TV Interviews */}
          <BentoItem
            title="สื่อโทรทัศน์"
            description="Glitter Tattoo ออกรายการชั้นนำ"
            href={`/${locale}/about`}
            type="dark"
            className="md:col-span-1 md:row-span-1"
          />
        </div>
      </Container>
    </section>
  );
}
