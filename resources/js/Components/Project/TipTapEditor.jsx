import React, { useState } from 'react'; // 🔥 Додали useState
import { Box, Divider, ToggleButton, ToggleButtonGroup, Typography, Collapse } from '@mui/material'; // 🔥 Додали Collapse
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

// 1. Компонент панелі інструментів (без змін)
const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

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

// 2. Головний компонент редактора
export default function TipTapEditor({ value, onChange }) {
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
        // Перевіряємо, чи новий елемент у фокусі (relatedTarget) 
        // знаходиться ВСЕРЕДИНІ нашого Box (currentTarget).
        // Якщо клік був поза редактором — ховаємо меню.
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsFocused(false);
        }
    };

    return (
        <Box sx={{ mb: 2 }}>
            {/* <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
                Опис
            </Typography> */}
            
            <Box 
                onFocus={() => setIsFocused(true)} // 🔥 Показуємо меню при кліку всередину
                onBlur={handleBlur}                // 🔥 Ховаємо меню при кліку назовні
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
                        minHeight: '120px',
                        fontSize: '0.875rem',
                        padding: '12px 4px', // Додав трохи відступу зверху/знизу, щоб текст не прилипав
                    },
                    '& .ProseMirror ul, & .ProseMirror ol': {
                        paddingLeft: '1.5rem',
                    },
                    '& .ProseMirror p.is-editor-empty:first-of-type::before': {
                        color: '#adb5bd',
                        content: 'attr(data-placeholder)',
                        float: 'left',
                        height: 0,
                        pointerEvents: 'none',
                    }
                }}>
                    <EditorContent editor={editor} />
                </Box>
            </Box>
        </Box>
    );
}