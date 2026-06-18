import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page-home">
      <section className="hero">
        <div className="container">
          <h1>مرحباً بكم في سنتر الدروس</h1>
          <p>المركز التعليمي المتخصص في تدريس المواد الدراسية لجميع المراحل بأحدث الأساليب التعليمية</p>
          <div className="hero-buttons">
            <Link to="/courses" className="btn btn-primary">استعرض الكورسات</Link>
            <Link to="/teachers" className="btn btn-secondary">تعرف على المدرسين</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>لماذا تختار سنتر الدروس؟</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">👨‍🏫</span>
              <h3>مدرسين متخصصين</h3>
              <p>نخبة من أفضل المدرسين في جميع المواد</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📚</span>
              <h3>مناهج محدثة</h3>
              <p>نواكب أحدث التغييرات في المناهج الدراسية</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💻</span>
              <h3>تقنية حديثة</h3>
              <p>نستخدم أحدث الوسائل التكنولوجية في التعليم</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3>متابعة مستمرة</h3>
              <p>نظام متابعة دقيق لأداء الطلاب وتقارير دورية</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
