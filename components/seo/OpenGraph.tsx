import Image from 'next/image';

interface OpenGraphImageProps {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  logo?: boolean;
  gradient?: string;
}

export function OpenGraphImage({
  title,
  description,
  author,
  date,
  logo = true,
  gradient = 'from-[#FA8072] to-[#FF6B6B]'
}: OpenGraphImageProps) {
  return (
    <div className="w-[1200px] h-[630px] flex flex-col justify-between p-16 bg-white">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-2xl text-gray-600 leading-relaxed max-w-4xl">
            {description}
          </p>
        )}
      </div>
      
      {/* Footer */}
      <div className="relative z-10 flex items-end justify-between">
        <div className="flex items-center gap-6">
          {author && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div>
                <p className="text-lg font-medium text-gray-900">{author}</p>
                {date && (
                  <p className="text-sm text-gray-600">{date}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {logo && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FA8072] to-[#FF6B6B] rounded-xl" />
            <span className="text-2xl font-bold text-gray-900">CourseFlow</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Dynamic OG image generator component
interface DynamicOGImageProps {
  title: string;
  subtitle?: string;
  tags?: string[];
  theme?: 'light' | 'dark' | 'gradient';
}

export function DynamicOGImage({
  title,
  subtitle,
  tags,
  theme = 'gradient'
}: DynamicOGImageProps) {
  const themes = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    gradient: 'bg-gradient-to-br from-[#FA8072] to-[#FF6B6B] text-white'
  };

  return (
    <div className={`w-[1200px] h-[630px] flex flex-col justify-center items-center p-16 ${themes[theme]}`}>
      <div className="text-center max-w-4xl">
        <h1 className="text-7xl font-bold mb-6 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-3xl opacity-90 mb-8">
            {subtitle}
          </p>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-lg"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// OG image template for courses
interface CourseOGImageProps {
  courseName: string;
  institution?: string;
  term?: string;
  fileCount?: number;
  professor?: string;
}

export function CourseOGImage({
  courseName,
  institution,
  term,
  fileCount,
  professor
}: CourseOGImageProps) {
  return (
    <div className="w-[1200px] h-[630px] relative overflow-hidden bg-white">
      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50" />
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl"
              style={{
                left: `${(i % 3) * 40}%`,
                top: `${Math.floor(i / 3) * 60}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-16">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl" />
            <span className="text-2xl font-bold text-gray-900">CourseFlow</span>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            {courseName}
          </h1>
          
          {institution && (
            <p className="text-2xl text-gray-600 mb-2">{institution}</p>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div className="flex gap-8">
            {term && (
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Term</p>
                <p className="text-xl font-semibold text-gray-900">{term}</p>
              </div>
            )}
            {professor && (
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Professor</p>
                <p className="text-xl font-semibold text-gray-900">{professor}</p>
              </div>
            )}
            {fileCount !== undefined && (
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Files</p>
                <p className="text-xl font-semibold text-gray-900">{fileCount}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}