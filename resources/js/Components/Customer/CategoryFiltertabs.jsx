import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryFilterTabs({ 
    categories, 
    selectedCategoryId, 
    onSelect 
}) {
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const selectedTab = scrollContainerRef.current.querySelector('[data-selected="true"]');
            if (selectedTab) {
                selectedTab.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [selectedCategoryId]);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="bg-[color:var(--color-bg-primary)] border-b border-[color:var(--color-border)]">
            <div className="max-w-6xl mx-auto relative group">
                <button
                    onClick={() => scroll('left')}
                    className="hidden group-hover:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 bg-[color:var(--color-bg-primary)] rounded-r-[var(--radius-md)] hover:bg-[color:var(--color-bg-secondary)] transition-colors duration-[var(--transition-fast)]"
                >
                    <ChevronLeft className="w-4 h-4 text-[color:var(--color-text-primary)]" />
                </button>

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-1 px-4 py-4 scroll-smooth scrollbar-hide"
                >
                    {categories.map(category => (
                        <button
                            key={category.id}
                            data-selected={selectedCategoryId === category.id}
                            onClick={() => onSelect(category.id)}
                            className={`
                                px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap
                                flex items-center gap-2 flex-shrink-0
                                transition-all duration-[var(--transition-normal)]
                                ${selectedCategoryId === category.id
                                    ? 'bg-[color:var(--color-primary-600)] text-white'
                                    : 'bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-tertiary)]'
                                }
                            `}
                        >
                            <span>{category.name}</span>
                            {category.item_count > 0 && (
                                <span className={`
                                    text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center
                                    ${selectedCategoryId === category.id
                                        ? 'bg-white/30 text-white'
                                        : 'bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-700)]'
                                    }
                                `}>
                                    {category.item_count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => scroll('right')}
                    className="hidden group-hover:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 bg-[color:var(--color-bg-primary)] rounded-l-[var(--radius-md)] hover:bg-[color:var(--color-bg-secondary)] transition-colors duration-[var(--transition-fast)]"
                >
                    <ChevronRight className="w-4 h-4 text-[color:var(--color-text-primary)]" />
                </button>
            </div>
        </div>
    );
}