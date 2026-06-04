// /components/ProgressBar.tsx
import React, { useEffect, useRef } from 'react';

interface ProgressBarProps {
    progress: number; // 0-100
    className?: string;
    barClassName?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    className = '',
    barClassName = ''
}) => {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (barRef.current) {
            barRef.current.style.width = `${Math.max(0, Math.min(100, progress))}%`;
        }
    }, [progress]);

    return (
        <div className={`h-3 bg-white/30 rounded-full overflow-hidden ${className}`}>
            <div
                ref={barRef}
                className={`h-full bg-white transition-all duration-500 rounded-full ${barClassName}`}
            />
        </div>
    );
};

export default ProgressBar;
