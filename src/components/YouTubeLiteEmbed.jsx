import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';

function YouTubeLiteEmbed({
  className = '',
  description,
  posterSrc,
  title,
  videoId,
}) {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&playsinline=1&rel=0&modestbranding=1`;

  if (isPlayerVisible) {
    return (
      <iframe
        className={`h-full w-full aspect-video ${className}`.trim()}
        src={embedUrl}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`.trim()}>
      <img
        src={posterSrc}
        alt={title}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

      <div className="absolute inset-0 flex items-center justify-center p-6">
        <button
          type="button"
          onClick={() => setIsPlayerVisible(true)}
          className="inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/14 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:bg-white/20 sm:text-base"
          aria-label={`Play ${title}`}
        >
          <PlayCircle className="h-6 w-6" />
          <span>Play walkthrough</span>
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <div className="rounded-2xl bg-black/35 p-4 backdrop-blur-sm">
          <p className="text-white font-medium">{title}</p>
          {description ? (
            <p className="mt-1 text-sm text-gray-200">{description}</p>
          ) : null}
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-sm font-medium text-emerald-200 underline-offset-4 hover:underline"
          >
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

export default YouTubeLiteEmbed;
