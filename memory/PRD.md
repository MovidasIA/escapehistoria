# Escape Room "La Historia Interminable" - Landing Page

## Problem Statement
Crear una página de inicio para un Escape Room basado en "La Historia Interminable" donde:
- 4 grupos (Los Comerrocas, Los Silfos Nocturnos, Los Fuegos Fatuos, Los Diminutenses) en las esquinas
- 20 nombres de alumnos flotando por la página
- Imagen del Auryn en el centro que, al hacer click, ordena los nombres en sus grupos
- Dary queda junto al Auryn con mensaje "Ayudante de Jose"

## User Personas
- **Jose**: Organizador del Escape Room que usa la app para asignar grupos
- **Alumnos**: Participantes que verán la asignación de grupos

## Core Requirements (Static)
- Animación suave y aleatoria de nombres flotando
- Animación mágica/espectacular al hacer click en el Auryn
- Mensaje de Dary aparece después de que todos los nombres estén en su lugar
- Estado se reinicia al recargar la página
- Sin efectos de sonido

## Distribution
- **Los Comerrocas**: Pablo A, Olivia, Carlos, Luz
- **Los Silfos Nocturnos**: Jorge, Agustín, David, Valeria, Miriam
- **Los Fuegos Fatuos**: Salva, Zoe, Adriana, Raúl, Marcos
- **Los Diminutenses**: Elena, Lucía, Alonso, Ángel, Pablo M
- **Especial**: Dary - "Ayudante de Jose"

## What's Been Implemented (Marzo 2026)
- [x] Página con estética mágica oscura inspirada en La Historia Interminable
- [x] 4 grupos en esquinas con colores distintivos (amarillo, naranja, verde)
- [x] 20 nombres flotando con animación suave y aleatoria
- [x] Auryn en el centro con efecto de pulso/rotación
- [x] Animación espectacular de sorting al hacer click (framer-motion layoutId)
- [x] Dary con mensaje "Ayudante de Jose" aparece después del sorting
- [x] Partículas mágicas de fondo
- [x] Fuente Cinzel para estética fantasy

## Architecture
- **Frontend**: React + Framer Motion
- **Styling**: Tailwind CSS + Custom CSS
- **No Backend Required**: App frontend pura

## P0 Features (Complete)
- ✅ Floating names animation
- ✅ Auryn click trigger
- ✅ Sorting animation
- ✅ Dary special message

## P1 Features (Backlog)
- Botón de reset para volver al estado inicial sin recargar
- Animaciones de confetti/partículas al completar el sorting

## P2 Features (Future)
- Modo presentación con música de fondo opcional
- Countdown antes del sorting
