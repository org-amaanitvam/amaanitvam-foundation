import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import CourseCatalog from './features/catalog/CourseCatalog';
import CourseDetail from './features/course/CourseDetail';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CourseCatalog />} />
        <Route path="/course/:slug" element={<CourseDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}