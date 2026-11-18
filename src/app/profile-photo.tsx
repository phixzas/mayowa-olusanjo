"use client";

import Image from "next/image";
import { useState } from "react";

const profilePhotoUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/profile-photos/profile-photo`
  : null;

export default function ProfilePhoto({
  className,
  eager = false,
}: {
  className: string;
  eager?: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className={className}
      role="img"
      aria-label="Mayowa Philips Olusanjo"
    >
      {profilePhotoUrl && !imageFailed && (
        <Image
          className="profile-photo-image"
          src={profilePhotoUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 220px, 360px"
          loading={eager ? "eager" : "lazy"}
          unoptimized
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
        />
      )}
      {!imageLoaded && (
        <div className="profile-photo-placeholder" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="17" r="8" />
            <path d="M9 41c1-8 7-13 15-13s14 5 15 13" />
          </svg>
          <span>
            {profilePhotoUrl && !imageFailed ? "LOADING PHOTO…" : "YOUR PHOTO HERE"}
          </span>
        </div>
      )}
    </div>
  );
}
