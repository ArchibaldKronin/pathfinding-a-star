# Поиск пути между прямоугольниками на Canvas

Этот проект реализует алгоритм маршрутизации между прямоугольниками на canvas с использованием A\* и библиотеки [`rbush`](https://github.com/mourner/rbush) для ускорения оптимизации пространственных вычислений.<br>
[GitHub](https://github.com/ArchibaldKronin/pathfinding-a-star)<br>
[Демо](https://pathfinding-a-star.netlify.app/)

---

## Общая информация

### Установка и запуск

```bash
npm install
npm run dev
```

---

### Тестирование

```bash
npm run test:ui
```

---

### Особенности и функциональность

- Drag-and-drop перемещение прямоугольников
- Автоматический пересчёт маршрута
- Возможность менять точки подключения к граням прямоугольников
- Алгоритм поиска пути A\* вычислением эвристики (манхэттенское расстояние) и штрафом за повороты
- Проверка валидности сегментов
- Использование R-Tree для ускорения вычислений

---

### Файловая структура

- `/src/components` — UI-компоненты
- `/src/geometry/utils.ts`, `/src/geometry/supportFunctions.ts` - геометрия, алгоритмы, вспомогательные функции
- `/src/geometry/dataConverter.ts` — основная функция
- `/src/geometry/drawingFunctions.ts` — функции для работы с Canvas API
- `/src/geometry/tests` — юнит-тесты
- `/src/hooks` — кастомные хуки
- `/src/types` — типы и интерфейсы

---

### ТЗ

Проект выполнен в соответствии с [ТЗ](https://docs.google.com/document/d/1Mck5tZn5z5RbmEgGRuKIeRWEKjlswmLIrbh1-11eS4A/edit?tab=t.0)

---

### Стек

- React + TypeScript
- Vite
- Vitest для тестов
- rbush
- Canvas API
