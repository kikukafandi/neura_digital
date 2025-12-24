"use client";

import { useState, useEffect, useRef } from "react";
import { getAutomations, saveAutomation, deleteAutomation } from "@/app/actions";
import { 
    Zap, Plus, Trash2, Save, Workflow, 
    MessageCircle, Mail, CheckSquare, X, MousePointer2,
    Settings2, GripHorizontal, PlayCircle, AlertTriangle, Layers, Hand
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "@/components/ConfirmModal"; 

export default function NeuralCanvasPage() {
    const [savedFlows, setSavedFlows] = useState([]);
    
    // --- CANVAS STATE ---
    const [currentFlowId, setCurrentFlowId] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]); 
    const [flowName, setFlowName] = useState("");
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    
    // --- TOOL & INTERACTION ---
    const [activeTool, setActiveTool] = useState("POINTER"); // 'POINTER' | 'HAND'
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [clipboard, setClipboard] = useState([]); 
    
    // Dragging & Selecting State
    const [isPanning, setIsPanning] = useState(false);
    const [isBoxSelecting, setIsBoxSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
    
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [connectingNodeId, setConnectingNodeId] = useState(null);
    const [tempEdgeEnd, setTempEdgeEnd] = useState(null);
    
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
    
    const containerRef = useRef(null);
    const dragStartRef = useRef({ x: 0, y: 0 }); 

    useEffect(() => { loadData(); }, []);

    // --- KEYBOARD SHORTCUTS (FIXED) ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isEditorOpen) return;
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            // 1. DELETE
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedIds.length > 0) removeSelectedNodes();
            }

            // 2. SELECT ALL (Ctrl + A)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                setSelectedIds(nodes.map(n => n.id));
                toast.success(`${nodes.length} nodes terpilih`);
            }

            // 3. DUPLICATE (Ctrl + D) - [FIXED]
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                e.preventDefault(); // Mencegah Bookmark Browser
                
                const selectedNodes = nodes.filter(n => selectedIds.includes(n.id));
                if (selectedNodes.length > 0) {
                    const newIds = [];
                    const newNodes = selectedNodes.map(node => {
                        const newId = crypto.randomUUID().slice(0, 4);
                        newIds.push(newId);
                        return {
                            ...node,
                            id: newId,
                            position: { x: node.position.x + 30, y: node.position.y + 30 } // Offset sedikit
                        };
                    });
                    
                    setNodes(prev => [...prev, ...newNodes]);
                    setSelectedIds(newIds); // Select hasil duplikat
                    toast.success(`Duplicated ${newNodes.length} nodes`);
                }
            }

            // 4. TOOLS
            if (e.key.toLowerCase() === 'h') setActiveTool('HAND');
            if (e.key.toLowerCase() === 'v') setActiveTool('POINTER');
            if (e.code === 'Space' && !e.repeat) { e.preventDefault(); setActiveTool('HAND'); }

            // 5. COPY (Ctrl+C)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                const selectedNodes = nodes.filter(n => selectedIds.includes(n.id));
                if (selectedNodes.length > 0) {
                    setClipboard(selectedNodes);
                    toast.success("Copied to clipboard");
                }
            }

            // 6. PASTE (Ctrl+V)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
                if (clipboard.length > 0) {
                    const newIds = [];
                    const newNodes = clipboard.map(node => {
                        const newId = crypto.randomUUID().slice(0, 4);
                        newIds.push(newId);
                        return {
                            ...node,
                            id: newId,
                            position: { x: node.position.x + 50, y: node.position.y + 50 }
                        };
                    });
                    setNodes(prev => [...prev, ...newNodes]);
                    setSelectedIds(newIds);
                }
            }

            // 7. SAVE (Ctrl+S)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                handleSave();
            }

            // 8. ESCAPE
            if (e.key === 'Escape') {
                setSelectedIds([]);
                setConnectingNodeId(null);
                setIsBoxSelecting(false);
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === 'Space') setActiveTool('POINTER');
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isEditorOpen, selectedIds, clipboard, flowName, nodes, edges]);

    // --- DATA HANDLING ---
    async function loadData() {
        const data = await getAutomations();
        setSavedFlows(data);
    }

    const loadFlow = (flow) => {
        const { nodes, edges } = flow.flowData;
        setNodes(nodes || []);
        setEdges(edges || []);
        setFlowName(flow.name);
        setCurrentFlowId(flow.id);
        setTransform({ x: 0, y: 0, scale: 1 });
        setIsEditorOpen(true);
        setActiveTool('POINTER');
        setSelectedIds([]);
    };

    // --- MOUSE HANDLERS ---
    const handleWheel = (e) => {
        if (!isEditorOpen) return;
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(transform.scale + delta, 0.2), 3);
        setTransform(prev => ({ ...prev, scale: newScale }));
    };

    const handleCanvasMouseDown = (e) => {
        if (e.button === 1 || activeTool === 'HAND') {
            e.preventDefault();
            setIsPanning(true);
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            return;
        }

        if (e.button === 0 && activeTool === 'POINTER') {
            if(e.target === containerRef.current) {
                if (!e.shiftKey) setSelectedIds([]);
                setIsBoxSelecting(true);
                const rect = containerRef.current.getBoundingClientRect();
                const startX = e.clientX - rect.left;
                const startY = e.clientY - rect.top;
                dragStartRef.current = { x: startX, y: startY };
                setSelectionBox({ x: startX, y: startY, w: 0, h: 0 });
            }
        }
    };

    const handleCanvasMouseMove = (e) => {
        if (isPanning) {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            return;
        }

        if (isBoxSelecting) {
            const rect = containerRef.current.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            const startX = dragStartRef.current.x;
            const startY = dragStartRef.current.y;
            setSelectionBox({
                x: Math.min(startX, currentX),
                y: Math.min(startY, currentY),
                w: Math.abs(currentX - startX),
                h: Math.abs(currentY - startY)
            });
            return;
        }

        if (draggingNodeId && activeTool === 'POINTER') {
            const dx = (e.clientX - dragStartRef.current.x) / transform.scale;
            const dy = (e.clientY - dragStartRef.current.y) / transform.scale;
            setNodes(prev => prev.map(n => {
                if (selectedIds.includes(n.id)) {
                    return { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } };
                }
                return n;
            }));
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            return;
        }

        if (connectingNodeId) {
            const rect = containerRef.current.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
            const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;
            setTempEdgeEnd({ x: mouseX, y: mouseY });
        }
    };

    const handleCanvasMouseUp = () => {
        if (isBoxSelecting) {
            const selectedInBox = nodes.filter(node => {
                const nodeScreenX = node.position.x * transform.scale + transform.x;
                const nodeScreenY = node.position.y * transform.scale + transform.y;
                return (
                    nodeScreenX + 250 > selectionBox.x &&
                    nodeScreenX < selectionBox.x + selectionBox.w &&
                    nodeScreenY + 100 > selectionBox.y &&
                    nodeScreenY < selectionBox.y + selectionBox.h
                );
            }).map(n => n.id);
            setSelectedIds(prev => [...new Set([...prev, ...selectedInBox])]);
            setIsBoxSelecting(false);
            setSelectionBox({ x: 0, y: 0, w: 0, h: 0 });
        }
        setIsPanning(false);
        setDraggingNodeId(null);
        setConnectingNodeId(null);
        setTempEdgeEnd(null);
    };

    const handleNodeMouseDown = (e, id) => {
        if (activeTool === 'HAND') return;
        e.stopPropagation();
        if (e.button !== 0) return;
        let newSelection = [...selectedIds];
        if (e.shiftKey) {
            if (newSelection.includes(id)) newSelection = newSelection.filter(i => i !== id);
            else newSelection.push(id);
        } else {
            if (!selectedIds.includes(id)) newSelection = [id];
        }
        setSelectedIds(newSelection);
        setDraggingNodeId(id);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const removeSelectedNodes = () => {
        setNodes(nodes.filter(n => !selectedIds.includes(n.id)));
        setEdges(edges.filter(e => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)));
        setSelectedIds([]);
    };

    const startConnection = (e, nodeId) => {
        if (activeTool === 'HAND') return;
        e.stopPropagation();
        setConnectingNodeId(nodeId);
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - transform.x) / transform.scale;
        const mouseY = (e.clientY - rect.top - transform.y) / transform.scale;
        setTempEdgeEnd({ x: mouseX, y: mouseY });
    };

    const completeConnection = (e, targetId) => {
        e.stopPropagation();
        if (connectingNodeId && connectingNodeId !== targetId) {
            const exists = edges.find(ed => ed.source === connectingNodeId && ed.target === targetId);
            if (!exists) {
                setEdges(prev => [...prev, { id: `e-${connectingNodeId}-${targetId}`, source: connectingNodeId, target: targetId }]);
            }
        }
        setConnectingNodeId(null);
        setTempEdgeEnd(null);
    };

    // --- VALIDATION & TEST RUN [RESTORED] ---
    const validateCircuit = () => {
        let errors = [];
        const triggers = nodes.filter(n => n.type === 'TRIGGER');
        if (triggers.length === 0) errors.push("Wajib ada minimal 1 Trigger (Pemicu).");
        
        nodes.forEach(node => {
            if (node.type === 'TRIGGER') {
                const hasOutput = edges.some(e => e.source === node.id);
                if (!hasOutput) errors.push(`Trigger "${node.data.label}" tidak tersambung.`);
            } else {
                const hasInput = edges.some(e => e.target === node.id);
                if (!hasInput) errors.push(`Action "${node.data.label}" tidak punya input.`);
            }
            if (node.data.action === 'SEND_WA' && !node.data.message) errors.push("Pesan WA tidak boleh kosong.");
        });
        return errors;
    };

    const handleTestRun = () => {
        const errors = validateCircuit();
        if (errors.length > 0) {
            toast.error(errors[0], { icon: <AlertTriangle size={18}/> });
        } else {
            toast.success("Logika Valid! Sirkuit berjalan normal.");
        }
    };

    const handleSave = async () => {
        if (!flowName) return toast.error("Beri nama sirkuit dulu!");
        const errors = validateCircuit();
        if (errors.length > 0) return toast.error(errors[0]);

        const res = await saveAutomation(currentFlowId, flowName, { nodes, edges });
        if (res.success) {
            toast.success(res.success);
            setIsEditorOpen(false);
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const addNode = (type, data) => {
        const id = crypto.randomUUID().slice(0, 4);
        const rect = containerRef.current?.getBoundingClientRect();
        const centerX = ((-transform.x + (rect ? rect.width/2 : 400)) / transform.scale);
        const centerY = ((-transform.y + (rect ? rect.height/2 : 300)) / transform.scale);
        const newNode = { id, type, position: { x: centerX, y: centerY }, data };
        setNodes([...nodes, newNode]);
        setSelectedIds([id]);
    };

    const singleSelectedNode = selectedIds.length === 1 ? nodes.find(n => n.id === selectedIds[0]) : null;

    return (
        <div className="min-h-screen pb-20 text-slate-200 relative">
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }}} />
            <ConfirmModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} {...modalConfig} />

            {/* DASHBOARD HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 px-4 md:px-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Workflow className="text-cyan-400" /> Neural Canvas
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">Automasi pro dengan kontrol keyboard penuh.</p>
                </div>
                <button 
                    onClick={() => {
                        setNodes([]); setEdges([]); setFlowName(""); setCurrentFlowId(null);
                        setTransform({ x: 0, y: 0, scale: 1 }); setIsEditorOpen(true);
                    }}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-all"
                >
                    <Plus size={18} /> Buat Baru
                </button>
            </div>

            {/* LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
                {savedFlows.map(flow => (
                    <div 
                        key={flow.id} 
                        onClick={() => loadFlow(flow)}
                        className="relative group bg-[#0A0F1E] border border-white/5 p-6 rounded-2xl hover:border-cyan-500/30 transition-all cursor-pointer hover:shadow-lg"
                    >
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={(e) => {
                                e.stopPropagation();
                                setModalConfig({
                                    isOpen: true, title: "Hapus?", message: "Permanen.", variant: "danger", confirmText: "Hapus",
                                    onConfirm: async () => { await deleteAutomation(flow.id); loadData(); setModalConfig({isOpen:false}); }
                                });
                            }} className="text-slate-500 hover:text-red-400 p-2 hover:bg-white/10 rounded-lg"><Trash2 size={16}/></button>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400"><Workflow size={24}/></div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{flow.name}</h3>
                                <p className="text-xs text-slate-500">{flow.flowData?.nodes?.length || 0} Nodes</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* EDITOR */}
            <AnimatePresence>
                {isEditorOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="fixed inset-0 z-[100] bg-[#050B14] flex flex-col"
                    >
                        {/* TOOLBAR */}
                        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0A0F1E]/90 backdrop-blur-md z-50 shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"><X size={20}/></button>
                                <div className="h-6 w-[1px] bg-white/10"></div>
                                <input value={flowName} onChange={e => setFlowName(e.target.value)} placeholder="Nama Sirkuit..." className="bg-transparent text-white font-bold text-lg outline-none w-64" />
                            </div>
                            
                            <div className="absolute left-1/2 -translate-x-1/2 bg-[#1E293B] border border-white/10 rounded-full px-4 py-1.5 flex gap-4 text-xs font-bold text-slate-400 pointer-events-none">
                                <div className={`flex items-center gap-1 ${activeTool === 'POINTER' ? 'text-cyan-400' : ''}`}><MousePointer2 size={12}/> (V)</div>
                                <div className={`flex items-center gap-1 ${activeTool === 'HAND' ? 'text-cyan-400' : ''}`}><Hand size={12}/> (Space)</div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* [RESTORED] TEST BUTTON */}
                                <button onClick={handleTestRun} className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-bold hover:bg-yellow-500/20 transition">
                                    <PlayCircle size={16}/> Test
                                </button>
                                <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
                                <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg active:scale-95 transition">
                                    <Save size={18} /> Simpan
                                </button>
                            </div>
                        </div>

                        {/* CANVAS WORKSPACE */}
                        <div 
                            className={`flex-1 relative overflow-hidden outline-none ${activeTool === 'HAND' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                            ref={containerRef}
                            onWheel={handleWheel}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            tabIndex={0} 
                        >
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
                                backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', 
                                backgroundSize: `${20 * transform.scale}px ${20 * transform.scale}px`,
                                backgroundPosition: `${transform.x}px ${transform.y}px`
                            }}></div>

                            <div style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', width: '100%', height: '100%' }}>
                                <svg className="absolute top-0 left-0 overflow-visible pointer-events-none w-full h-full" style={{ zIndex: 0 }}>
                                    {edges.map(edge => {
                                        const src = nodes.find(n => n.id === edge.source);
                                        const tgt = nodes.find(n => n.id === edge.target);
                                        if(!src || !tgt) return null;
                                        const x1 = src.position.x + 250; const y1 = src.position.y + 40;
                                        const x2 = tgt.position.x; const y2 = tgt.position.y + 40;
                                        return <path key={edge.id} d={`M ${x1} ${y1} C ${x1+80} ${y1}, ${x2-80} ${y2}, ${x2} ${y2}`} fill="none" stroke="#06b6d4" strokeWidth="3" />;
                                    })}
                                    {connectingNodeId && tempEdgeEnd && (() => {
                                        const src = nodes.find(n => n.id === connectingNodeId);
                                        if(!src) return null;
                                        const x1 = src.position.x + 250; const y1 = src.position.y + 40;
                                        return <path d={`M ${x1} ${y1} C ${x1+80} ${y1}, ${tempEdgeEnd.x-80} ${tempEdgeEnd.y}, ${tempEdgeEnd.x} ${tempEdgeEnd.y}`} fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="5,5" />;
                                    })()}
                                </svg>

                                {nodes.map(node => {
                                    const isSelected = selectedIds.includes(node.id);
                                    return (
                                        <div 
                                            key={node.id}
                                            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                            style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)` }}
                                            className={`absolute w-[250px] bg-[#1E293B] rounded-xl border-2 shadow-2xl p-4 transition-shadow 
                                                ${activeTool === 'POINTER' ? 'pointer-events-auto' : 'pointer-events-none'}
                                                ${node.type === 'TRIGGER' ? 'border-orange-500/50' : 'border-cyan-500/50'} 
                                                ${isSelected ? 'ring-2 ring-white z-50 shadow-cyan-500/20' : 'z-10'}`}
                                        >
                                            <div className="flex justify-between items-center mb-3 pointer-events-none">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${node.type === 'TRIGGER' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{node.type}</span>
                                            </div>
                                            <div className="font-bold text-white text-sm flex items-center gap-2 pointer-events-none">
                                                {node.type === 'TRIGGER' ? <Zap size={16}/> : <CheckSquare size={16}/>}
                                                {node.data.label}
                                            </div>
                                            {node.data.message && <div className="text-xs text-slate-400 mt-2 truncate pt-2 border-t border-white/5 pointer-events-none">"{node.data.message}"</div>}

                                            {activeTool === 'POINTER' && (
                                                <>
                                                    {node.type === 'ACTION' && <div onMouseUp={(e) => completeConnection(e, node.id)} className="absolute -left-3 top-10 w-6 h-6 rounded-full bg-[#020617] border-4 border-slate-500 hover:border-white hover:scale-125 transition-all cursor-crosshair z-50"></div>}
                                                    {node.type === 'TRIGGER' && <div onMouseDown={(e) => startConnection(e, node.id)} className="absolute -right-3 top-10 w-6 h-6 rounded-full bg-[#020617] border-4 border-orange-500 hover:border-white hover:scale-125 transition-all cursor-crosshair z-50"></div>}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {isBoxSelecting && (
                                <div className="absolute border border-cyan-500/50 bg-cyan-500/10 pointer-events-none z-[60]" style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.w, height: selectionBox.h }}></div>
                            )}

                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#0A0F1E]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center gap-4 shadow-2xl">
                                <div className="flex gap-2 pr-4 border-r border-white/10">
                                    <button onClick={() => addNode('TRIGGER', { event: 'TASK_COMPLETED', label: 'Task Selesai' })} className="w-12 h-12 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center text-orange-400"><Zap size={20}/></button>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => addNode('ACTION', { action: 'SEND_WA', label: 'Kirim WA', message: 'Halo!' })} className="w-12 h-12 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400"><MessageCircle size={20}/></button>
                                    <button onClick={() => addNode('ACTION', { action: 'SEND_EMAIL', label: 'Kirim Email', subject: 'Alert' })} className="w-12 h-12 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400"><Mail size={20}/></button>
                                    <button onClick={() => addNode('ACTION', { action: 'CREATE_TASK', label: 'Buat Task', content: 'Cek {task}' })} className="w-12 h-12 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400"><CheckSquare size={20}/></button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {selectedIds.length > 0 && (
                                    <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} className="absolute top-6 right-6 z-50 w-80 bg-[#0A0F1E]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-white font-bold flex items-center gap-2"><Settings2 size={16}/> {selectedIds.length > 1 ? 'Selection' : 'Config'}</h3>
                                            <button onClick={() => setSelectedIds([])}><X className="text-slate-500 hover:text-white"/></button>
                                        </div>
                                        {selectedIds.length > 1 ? (
                                            <div className="text-center py-6">
                                                <Layers className="mx-auto text-slate-600 mb-2" size={32}/>
                                                <p className="text-white font-bold text-lg">{selectedIds.length}</p>
                                                <p className="text-sm text-slate-500">Nodes Selected</p>
                                                <button onClick={removeSelectedNodes} className="w-full mt-6 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition">Hapus {selectedIds.length} Nodes</button>
                                            </div>
                                        ) : (
                                            singleSelectedNode && (
                                                <>
                                                    {singleSelectedNode.data.action === 'SEND_WA' && (
                                                        <div>
                                                            <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Pesan WhatsApp</label>
                                                            <textarea className="w-full bg-[#1E293B] text-white p-3 rounded-xl border border-slate-700 h-32 text-sm" value={singleSelectedNode.data.message} onChange={(e) => {
                                                                const updated = { ...singleSelectedNode, data: { ...singleSelectedNode.data, message: e.target.value } };
                                                                setNodes(nodes.map(n => n.id === singleSelectedNode.id ? updated : n));
                                                            }}/>
                                                        </div>
                                                    )}
                                                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                                                        <span className="text-xs text-slate-500">ID: {singleSelectedNode.id}</span>
                                                        <button onClick={removeSelectedNodes} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition"><Trash2 size={16}/></button>
                                                    </div>
                                                </>
                                            )
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}