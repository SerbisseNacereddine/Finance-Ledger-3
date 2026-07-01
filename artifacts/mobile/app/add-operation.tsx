import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ConfirmDialog from '@/components/ConfirmDialog';
import { useOperations } from '@/contexts/OperationsContext';
import { useColors } from '@/hooks/useColors';
import { OperationType } from '@/types';

const DateTimePicker = Platform.OS !== 'web'
  ? require('@react-native-community/datetimepicker').default
  : null;

const TYPE_OPTIONS: { label: string; sublabel: string; value: OperationType; color: string; icon: keyof typeof Feather.glyphMap }[] = [
  { label: 'Income',  sublabel: 'Money in',     value: 'income',  color: '#22C55E', icon: 'trending-up' },
  { label: 'Expense', sublabel: 'Money out',     value: 'expense', color: '#EF4444', icon: 'trending-down' },
  { label: 'Debt',    sublabel: 'Borrowed',      value: 'debt',    color: '#F97316', icon: 'credit-card' },
  { label: 'Lent',    sublabel: 'Given to others', value: 'lent', color: '#8B5CF6', icon: 'send' },
];

function formatDisplay(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AddOperationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { operations, addOperation, updateOperation, deleteOperation } = useOperations();

  const existing = id ? operations.find((o) => o.id === id) : null;
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [type, setType] = useState<OperationType>(existing?.type ?? 'expense');
  const [note, setNote] = useState(existing?.note ?? '');
  const [pickedDate, setPickedDate] = useState<Date>(
    existing ? new Date(existing.date) : new Date()
  );
  const [showPicker, setShowPicker] = useState(false);
  const [noteHeight, setNoteHeight] = useState(80);
  const noteRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const style = document.createElement('style');
    style.textContent = '.note-no-scroll::-webkit-scrollbar{display:none}.note-no-scroll{scrollbar-width:none;-ms-overflow-style:none;overflow-y:hidden}';
    document.head.appendChild(style);
    setTimeout(() => {
      const node = noteRef.current?._node ?? noteRef.current;
      if (node) node.classList.add('note-no-scroll');
    }, 100);
    return () => { document.head.removeChild(style); };
  }, []);
  const [dateText, setDateText] = useState(toInputValue(existing ? new Date(existing.date) : new Date()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!amount.trim()) e.amount = 'Amount is required';
    else if (isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Amount must be greater than 0';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const op = {
        title: title.trim(),
        amount: Number(amount),
        type,
        note: note.trim() || undefined,
        date: pickedDate.toISOString(),
      };
      if (isEdit && existing) {
        await updateOperation({ ...op, id: existing.id });
      } else {
        await addOperation(op);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    await deleteOperation(existing.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleDatePress = () => {
    setShowPicker(true);
  };

  const webPadTop = Platform.OS === 'web' ? 0 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: webPadTop + 12, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isEdit ? 'Edit Operation' : 'New Operation'}
        </Text>
        {isEdit ? (
          <Pressable onPress={() => setShowDeleteConfirm(true)} style={styles.headerBtn}>
            <Feather name="trash-2" size={20} color="#EF4444" />
          </Pressable>
        ) : (
          <Pressable onPress={handleSave} style={styles.headerBtn} disabled={saving}>
            <Feather name="check" size={22} color="#22C55E" />
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>TYPE</Text>
          <View style={styles.typeGrid}>
            {TYPE_OPTIONS.map((opt) => {
              const active = type === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.typeCard,
                    active
                      ? { backgroundColor: opt.color + '12', borderColor: opt.color, borderWidth: 1.5 }
                      : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1.5 },
                  ]}
                  onPress={() => setType(opt.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.typeLabel, { color: active ? opt.color : colors.mutedForeground }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DETAILS</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Title *</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: errors.title ? '#EF4444' : colors.border, outline: 'none' } as any]}
              value={title}
              onChangeText={(v) => { setTitle(v); setErrors((e) => ({ ...e, title: '' })); }}
              placeholder="e.g. Salary, Groceries"
              placeholderTextColor={colors.mutedForeground}
              returnKeyType="next"
            />
            {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Amount *</Text>
            <View style={[styles.amountWrap, { borderColor: errors.amount ? '#EF4444' : colors.border }]}>
              <TextInput
                style={[styles.amountInput, { color: colors.foreground, outline: 'none' } as any]}
                value={amount}
                onChangeText={(v) => { setAmount(v); setErrors((e) => ({ ...e, amount: '' })); }}
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="decimal-pad"
                returnKeyType="done"
                maxLength={15}
              />
              <Text style={[styles.currency, { color: colors.mutedForeground }]}>DZD</Text>
            </View>
            {errors.amount ? <Text style={styles.error}>{errors.amount}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Date</Text>

            {Platform.OS === 'web' ? (
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, outline: 'none' } as any]}
                value={dateText}
                onChangeText={(v) => {
                  setDateText(v);
                  const d = new Date(v + 'T12:00:00');
                  if (!isNaN(d.getTime()) && v.length === 10) setPickedDate(d);
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.mutedForeground}
              />
            ) : (
              <TouchableOpacity
                style={[styles.dateBtn, { borderColor: colors.border }]}
                onPress={handleDatePress}
                activeOpacity={0.75}
              >
                <Feather name="calendar" size={16} color={colors.mutedForeground} />
                <Text style={[styles.dateBtnText, { color: colors.foreground }]}>
                  {formatDisplay(pickedDate)}
                </Text>
                <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}

            {showPicker && Platform.OS !== 'web' && (
              <Modal transparent animationType="slide">
                <View style={styles.pickerOverlay}>
                  <View style={[styles.pickerSheet, { backgroundColor: colors.card }]}>
                    <View style={styles.pickerHeader}>
                      <TouchableOpacity onPress={() => setShowPicker(false)}>
                        <Text style={[styles.pickerDone, { color: '#1A237E' }]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={pickedDate}
                      mode="date"
                      display="spinner"
                      onChange={(_, d) => { if (d) setPickedDate(d); }}
                      style={{ width: '100%' }}
                    />
                  </View>
                </View>
              </Modal>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Note (optional)</Text>
            <TextInput
              ref={noteRef}
              style={[styles.input, styles.textArea, { color: colors.foreground, borderColor: colors.border, outline: 'none', height: noteHeight } as any]}
              value={note}
              onChangeText={(v) => {
                setNote(v);
                if (Platform.OS === 'web') {
                  setTimeout(() => {
                    const node = noteRef.current?._node ?? noteRef.current;
                    if (node) {
                      node.style.height = 'auto';
                      const next = Math.max(80, node.scrollHeight);
                      node.style.height = next + 'px';
                      setNoteHeight(next);
                    }
                  }, 0);
                }
              }}
              placeholder="Add a note..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              scrollEnabled={false}
              onContentSizeChange={(e) => {
                if (Platform.OS !== 'web') {
                  const h = e.nativeEvent.contentSize.height;
                  setNoteHeight(Math.max(80, h + 16));
                }
              }}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: '#1A237E' }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add Operation'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete Operation"
        message={`"${existing?.title}" will be permanently removed and all totals will be recalculated.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  content: { paddingHorizontal: 20, gap: 16, paddingTop: 8 },
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: {
    width: '47%',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    outlineWidth: 0,
  } as any,
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
    outlineWidth: 0,
  } as any,
  currency: { fontSize: 14, fontFamily: 'Inter_500Medium', marginLeft: 8 },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    position: 'relative',
  },
  dateBtnText: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  pickerDone: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  error: { fontSize: 12, color: '#EF4444', fontFamily: 'Inter_400Regular' },
  saveBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1A237E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
