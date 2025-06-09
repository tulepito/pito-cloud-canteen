import React from 'react';

interface VideoSectionProps {
  embedUrl: string;
  className?: string;
}

const VideoSection = ({ embedUrl, className }: VideoSectionProps) => {
  return (
    <section className={className}>
      <div className="relative w-full aspect-video rounded-md overflow-hidden border border-neutral-200">
        <iframe
          src={embedUrl}
          title="YouTube video"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen={false}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </section>
  );
};

export default VideoSection;
