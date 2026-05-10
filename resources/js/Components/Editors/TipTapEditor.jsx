import React, { useState } from 'react';
import { Box, Divider, ToggleButton, ToggleButtonGroup, Typography, Collapse } from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

// Іконки
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatClearIcon from '@mui/icons-material/FormatClear';

// Компонент панелі інструментів
const MenuBar = ({ editor }) => {
    if (!editor) return null;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa', flexWrap: 'wrap' }}>
            <ToggleButtonGroup size="small" sx={{ '& .MuiToggleButton-root': { border: 'none' } }}>
                <ToggleButton
                    value="bold"
                    selected={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <FormatBoldIcon fontSize="small" />
                </ToggleButton>
                
                <ToggleButton
                    value="italic"
                    selected={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <FormatItalicIcon fontSize="small" />
                </ToggleButton>
                
                <ToggleButton
                    value="strike"
                    selected={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <StrikethroughSIcon fontSize="small" />
                </ToggleButton>

                <ToggleButton
                    value="clear"
                    onClick={() => editor.chain().focus().unsetAllMarks().run()}
                >
                    <FormatClearIcon fontSize="small" />
                </ToggleButton>
            </ToggleButtonGroup>

            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

            <ToggleButtonGroup size="small" sx={{ '& .MuiToggleButton-root': { border: 'none' } }}>
                <ToggleButton
                    value="bulletList"
                    selected={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <FormatListBulletedIcon fontSize="small" />
                </ToggleButton>
                
                <ToggleButton
                    value="orderedList"
                    selected={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <FormatListNumberedIcon fontSize="small" />
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};

// Головний компонент редактора
export default function TipTapEditor({ value, onChange }) {
    // console.log('[TipTapEditor] value: ', value);
    // console.log('[TipTapEditor] onChange: ', onChange);
    // Стейт для відслідковування, чи активний зараз редактор
    const [isFocused, setIsFocused] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Додайте детальний опис',
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML()); 
        },
    });

    // Обробник втрати фокусу
    const handleBlur = (event) => {
        // Якщо клік був поза редактором — ховаємо меню.
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsFocused(false);
        }
    };

    return (
        <Box sx={{ mb: 2 }}>            
            <Box 
                onFocus={() => setIsFocused(true)} // Показуємо меню при кліку всередину
                onBlur={handleBlur} // Ховаємо меню при кліку назовні
                sx={{ 
                    border: '1px solid #c4c4c4', 
                    borderRadius: 2, 
                    overflow: 'hidden',
                    '&:focus-within': {
                        borderColor: 'secondary.main',
                        borderWidth: '2px',
                    }
                }}
            >
                <Collapse in={isFocused}>
                    <MenuBar editor={editor} />
                </Collapse>

                {/* Сам редактор */}
                <Box sx={{
                    pl: 1,
                    pr: 1,
                    bgcolor: '#fff',
                    '& .ProseMirror': {
                        outline: 'none', 
                        minHeight: '100px',
                        fontSize: '0.875rem',
                        padding: '15px 4px 4px 4px',
                    },
                    '& .ProseMirror ul, & .ProseMirror ol': {
                        paddingLeft: '1.5rem',
                    },
                    '& .ProseMirror ol': {
                        margin: '0px',
                    },
                    '& .ProseMirror p.is-editor-empty:first-of-type::before': {
                        color: '#adb5bd',
                        content: 'attr(data-placeholder)',
                        float: 'left',
                        height: 0,
                        pointerEvents: 'none',
                    },
                    '& .ProseMirror p': {
                        margin: '0px 0px 2px',
                    }
                }}>
                    <EditorContent editor={editor} />
                </Box>
            </Box>
        </Box>
    );
}


// встановлення пакетыв
// npm install @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-highlight

// import React, { useState } from 'react';
// import { Box, Divider, ToggleButton, ToggleButtonGroup, Typography, Collapse } from '@mui/material';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Placeholder from '@tiptap/extension-placeholder';

// // 🔥 Нові імпорти розширень TipTap
// import Underline from '@tiptap/extension-underline';
// import TextAlign from '@tiptap/extension-text-align';
// import Highlight from '@tiptap/extension-highlight';

// // Іконки форматування
// import FormatBoldIcon from '@mui/icons-material/FormatBold';
// import FormatItalicIcon from '@mui/icons-material/FormatItalic';
// import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
// import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'; // Підкреслення
// import HighlightIcon from '@mui/icons-material/Highlight'; // Маркер

// // Іконки вирівнювання
// import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
// import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
// import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
// import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';

// // Іконки списків та очищення
// import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
// import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
// import FormatClearIcon from '@mui/icons-material/FormatClear';

// // Компонент панелі інструментів
// const MenuBar = ({ editor }) => {
//     if (!editor) return null;

//     return (
//         <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa', flexWrap: 'wrap', gap: 0.5 }}>
            
//             {/* ГРУПА 1: Заголовки */}
//             <ToggleButtonGroup size="small" sx={{ '& .MuiToggleButton-root': { border: 'none' } }}>
//                 <ToggleButton
//                     value="h1"
//                     selected={editor.isActive('heading', { level: 1 })}
//                     onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
//                 >
//                     <Typography variant="caption" fontWeight="bold">H1</Typography>
//                 </ToggleButton>
//                 <ToggleButton
//                     value="h2"
//                     selected={editor.isActive('heading', { level: 2 })}
//                     onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
//                 >
//                     <Typography variant="caption" fontWeight="bold">H2</Typography>
//                 </ToggleButton>
//                 <ToggleButton
//                     value="h3"
//                     selected={editor.isActive('heading', { level: 3 })}
//                     onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
//                 >
//                     <Typography variant="caption" fontWeight="bold">H3</Typography>
//                 </ToggleButton>
//                 <ToggleButton
//                     value="paragraph"
//                     selected={editor.isActive('paragraph')}
//                     onClick={() => editor.chain().focus().setParagraph().run()}
//                 >
//                     <Typography variant="caption" fontWeight="bold">P</Typography>
//                 </ToggleButton>
//             </ToggleButtonGroup>

//             <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

//             {/* ГРУПА 2: Форматування тексту */}
//             <ToggleButtonGroup size="small" sx={{ '& .MuiToggleButton-root': { border: 'none' } }}>
//                 <ToggleButton
//                     value="bold"
//                     selected={editor.isActive('bold')}
//                     onClick={() => editor.chain().focus().toggleBold().run()}
//                 >
//                     <FormatBoldIcon fontSize="small" />
//                 </ToggleButton>
//                 <ToggleButton
//                     value="italic"
//                     selected={editor.isActive('italic')}
//                     onClick={() => editor.chain().focus().toggleItalic().run()}
//                 >
//                     <FormatItalicIcon fontSize="small" />
//                 </ToggleButton>
//                 <ToggleButton
//                     value="underline"
//                     selected={editor.isActive('underline')}
//                     onClick={() => editor.chain().focus().toggleUnderline().run()}
//                 >
//                     <FormatUnderlinedIcon fontSize="small" />
//                 </ToggleButton>
//                 <ToggleButton
//                     value="strike"
//                     selected={editor.isActive('strike')}
//                     onClick={() => editor.chain().focus().toggleStrike().run()}
//                 >
//                     <StrikethroughSIcon fontSize="small" />
//                 </ToggleButton>
//                 <ToggleButton
//                     value="highlight"
//                     selected={editor.isActive('highlight')}
//                     onClick={() => editor.chain().focus().toggleHighlight().run()}
//                 >
//                     <HighlightIcon fontSize="small" sx={{ color: editor.isActive('highlight') ? '#ffeb3b' : 'inherit' }} />
//                 </ToggleButton>
//                 <ToggleButton
//                     value="clear"
//                     onClick={() => editor.chain().focus().unsetAllMarks().run()}
//                 >
//                     <FormatClearIcon fontSize="small" />
//                 </ToggleButton>
//             </ToggleButtonGroup>

//             <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

//             {/* ГРУПА 3: Вирівнювання */}
//             <ToggleButtonGroup size="small" sx={{ '& .MuiToggleButton-root': { border: 'none' } }}>
//                 <ToggleButton
//                     value="left"
//                     selected={editor.isActive({ textAlign: 'left' })}
//                     onClick={() => editor.chain().focus().setTextAlign('left').run()}
//                 >
//                     <FormatAlignLeftIcon fontSize="small" />
//                 </ToggleButton>
//                 <ToggleButton
//                     value="center"
//                     selected={editor.isActive({ textAlign: 'center' })}
//                     onClick={() => editor.chain().focus().setTextAlign('center').run()}
//                 >
//                     <FormatAlignCenterIcon fontSize="small" />
//                 </ToggleButton>
//                 <ToggleButton
//                     value="right"
//                     selected={editor.isActive({ textAlign: 'right' })}
//                     onClick={() => editor.chain().focus().setTextAlign('right').run()}
//                 >
//                     <FormatAlignRightIcon fontSize="small" />
//                 </ToggleButton>
//                 <ToggleButton
//                     value="justify"
//                     selected={editor.isActive({ textAlign: 'justify' })}
//                     onClick={() => editor.chain().focus().setTextAlign('justify').run()}
//                 >
//                     <FormatAlignJustifyIcon fontSize="small" />
//                 </ToggleButton>
//             </ToggleButtonGroup>

//             <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

//             {/* ГРУПА 4: Списки */}
//             <ToggleButtonGroup size="small" sx={{ '& .MuiToggleButton-root': { border: 'none' } }}>
//                 <ToggleButton
//                     value="bulletList"
//                     selected={editor.isActive('bulletList')}
//                     onClick={() => editor.chain().focus().toggleBulletList().run()}
//                 >
//                     <FormatListBulletedIcon fontSize="small" />
//                 </ToggleButton>
//                 <ToggleButton
//                     value="orderedList"
//                     selected={editor.isActive('orderedList')}
//                     onClick={() => editor.chain().focus().toggleOrderedList().run()}
//                 >
//                     <FormatListNumberedIcon fontSize="small" />
//                 </ToggleButton>
//             </ToggleButtonGroup>
//         </Box>
//     );
// };

// // Головний компонент редактора
// export default function TipTapEditor({ value, onChange }) {
//     const [isFocused, setIsFocused] = useState(false);

//     const editor = useEditor({
//         extensions: [
//             StarterKit,
//             Placeholder.configure({
//                 placeholder: 'Додайте детальний опис',
//             }),
//             // 🔥 Підключаємо нові розширення тут
//             Underline,
//             Highlight.configure({
//                 // multicolor: true // Розкоментуй, якщо в майбутньому захочеш палітру як на картинці
//             }),
//             TextAlign.configure({
//                 types: ['heading', 'paragraph'],
//                 alignments: ['left', 'center', 'right', 'justify'],
//             }),
//         ],
//         content: value,
//         onUpdate: ({ editor }) => {
//             onChange(editor.getHTML()); 
//         },
//     });

//     const handleBlur = (event) => {
//         if (!event.currentTarget.contains(event.relatedTarget)) {
//             setIsFocused(false);
//         }
//     };

//     return (
//         <Box sx={{ mb: 2 }}>            
//             <Box 
//                 onFocus={() => setIsFocused(true)} 
//                 onBlur={handleBlur} 
//                 sx={{ 
//                     border: '1px solid #c4c4c4', 
//                     borderRadius: 2, 
//                     overflow: 'hidden',
//                     '&:focus-within': {
//                         borderColor: 'secondary.main',
//                         borderWidth: '2px',
//                     }
//                 }}
//             >
//                 <Collapse in={isFocused}>
//                     <MenuBar editor={editor} />
//                 </Collapse>

//                 <Box sx={{
//                     pl: 1, pr: 1, bgcolor: '#fff',
//                     '& .ProseMirror': {
//                         outline: 'none', 
//                         minHeight: '100px',
//                         fontSize: '0.875rem',
//                         padding: '15px 4px 4px 4px',
//                     },
//                     '& .ProseMirror ul, & .ProseMirror ol': { paddingLeft: '1.5rem' },
//                     '& .ProseMirror ol': { margin: '0px' },
//                     '& .ProseMirror p.is-editor-empty:first-of-type::before': {
//                         color: '#adb5bd',
//                         content: 'attr(data-placeholder)',
//                         float: 'left',
//                         height: 0,
//                         pointerEvents: 'none',
//                     },
//                     '& .ProseMirror p': { margin: '0px 0px 2px' },
//                     // 🔥 Додаємо трохи стилів для маркування, щоб воно виглядало красиво
//                     '& .ProseMirror mark': {
//                         backgroundColor: '#ffeb3b',
//                         padding: '0 4px',
//                         borderRadius: '2px'
//                     }
//                 }}>
//                     <EditorContent editor={editor} />
//                 </Box>
//             </Box>
//         </Box>
//     );
// }
