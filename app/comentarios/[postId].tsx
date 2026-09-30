import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../src/components/Avatar';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';
import { timeAgo } from '../../src/utils/time';

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  petName: string;
  avatarUrl: string | null;
};

type CommentRow = {
  id: string;
  text: string;
  created_at: string;
  user_id: string;
  profiles: { pet_name: string; avatar_url: string | null } | null;
};

export default function Comentarios() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const session = useAuthStore((state) => state.session);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!postId) return;
    const { data } = await supabase
      .from('comments')
      .select('id, text, created_at, user_id, profiles(pet_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    const rows = (data ?? []) as unknown as CommentRow[];
    setComments(
      rows.map((row) => ({
        id: row.id,
        text: row.text,
        createdAt: row.created_at,
        userId: row.user_id,
        petName: row.profiles?.pet_name || 'Alguien',
        avatarUrl: row.profiles?.avatar_url ?? null,
      }))
    );
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const sendComment = async () => {
    if (!session || !postId || !text.trim() || sending) return;
    setSending(true);
    setError(null);
    const body = text.trim();
    setText('');
    try {
      const { error: insertError } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: session.user.id, text: body });
      if (insertError) throw insertError;
      await load();
    } catch (err) {
      setText(body);
      setError(err instanceof Error ? err.message : 'No pudimos publicar el comentario. Probá de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Comentarios</Text>
          <View style={styles.iconButton} />
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.verdeParque} />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons name="chatbubble-outline" size={28} color={colors.textMuted} />
                <Text style={styles.emptyText}>Todavía no hay comentarios. ¡Dejá el primero!</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <Avatar uri={item.avatarUrl} size={32} background={colors.cremaBase} pawColor={colors.azulVereda} />
                <View style={styles.commentBody}>
                  <Text style={styles.commentText}>
                    <Text style={styles.commentAuthor}>{item.petName} </Text>
                    {item.text}
                  </Text>
                  <Text style={styles.commentTime}>{timeAgo(item.createdAt)}</Text>
                </View>
              </View>
            )}
          />
        )}

        {session ? (
          <>
            {error ? <Text style={styles.errorInline}>{error}</Text> : null}
            <View style={styles.inputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Escribí un comentario…"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
              maxLength={300}
            />
            <Pressable
              style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]}
              onPress={sendComment}
              disabled={!text.trim() || sending}
            >
              <Ionicons name="send" size={18} color={colors.azulVereda} />
            </Pressable>
            </View>
          </>
        ) : null}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cremaBase,
  },
  safeArea: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  loader: {
    marginTop: spacing.xxxl,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  emptyText: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  commentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  commentBody: {
    flex: 1,
    gap: 2,
  },
  commentText: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  commentAuthor: {
    fontFamily: fonts.textSemiBold,
  },
  commentTime: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  errorInline: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: '#E38585',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.verdeHuella,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
