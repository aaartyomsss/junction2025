import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { mockSocialFeed } from '@/services/mockData';
import { SaunaSession } from '@/types/sauna';

export default function SocialScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleLike = (sessionId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(sessionId)) {
      newLiked.delete(sessionId);
    } else {
      newLiked.add(sessionId);
    }
    setLikedPosts(newLiked);
  };

  const toggleExpanded = (sessionId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedPosts(newExpanded);
  };

  const getTempColor = (temp: number) => {
    if (temp >= 90) return '#FF4444';
    if (temp >= 80) return '#FF8800';
    if (temp >= 70) return '#FFB800';
    return '#4CAF50';
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Sauna Community</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            See what others are enjoying
          </ThemedText>
        </View>

        {/* Social Feed */}
        {mockSocialFeed.map((session: SaunaSession) => {
          const isLiked = likedPosts.has(session.id);
          const isExpanded = expandedPosts.has(session.id);
          const displayLikes = session.likes + (isLiked ? 1 : 0);

          return (
            <View key={session.id} style={[styles.postCard, { backgroundColor: colors.background }]}>
              {/* User Header */}
              <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{session.userAvatar || '👤'}</Text>
                  </View>
                  <View>
                    <ThemedText type="defaultSemiBold">{session.userName}</ThemedText>
                    <ThemedText style={[styles.timestamp, { color: colors.icon }]}>
                      {formatTimeAgo(session.startTime)}
                    </ThemedText>
                  </View>
                </View>
                <Text style={styles.menuIcon}>⋯</Text>
              </View>

              {/* Session Info */}
              <View style={styles.sessionInfo}>
                <View style={styles.locationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <ThemedText type="defaultSemiBold" style={styles.locationText}>
                    {session.location.name}
                  </ThemedText>
                </View>
                
                {session.notes && (
                  <ThemedText style={styles.postNotes}>{session.notes}</ThemedText>
                )}
              </View>

              {/* Stats Banner */}
              <View style={[styles.statsBanner, { backgroundColor: colors.tint + '10' }]}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>⏱️</Text>
                  <ThemedText style={styles.statText}>{session.duration} min</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>🌡️</Text>
                  <ThemedText style={[styles.statText, { color: getTempColor(session.averageTemp) }]}>
                    {session.averageTemp}°C
                  </ThemedText>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>🔥</Text>
                  <ThemedText style={[styles.statText, { color: getTempColor(session.maxTemp) }]}>
                    {session.maxTemp}°C max
                  </ThemedText>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>💧</Text>
                  <ThemedText style={styles.statText}>{session.averageHumidity}%</ThemedText>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleLike(session.id)}>
                  <Text style={styles.actionIcon}>{isLiked ? '❤️' : '🤍'}</Text>
                  <ThemedText style={styles.actionText}>{displayLikes}</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleExpanded(session.id)}>
                  <Text style={styles.actionIcon}>💬</Text>
                  <ThemedText style={styles.actionText}>{session.comments.length}</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>🔗</Text>
                  <ThemedText style={styles.actionText}>Share</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Comments Section */}
              {isExpanded && (
                <View style={styles.commentsSection}>
                  <View style={styles.commentsDivider} />
                  
                  {session.comments.length > 0 && (
                    <View style={styles.commentsList}>
                      {session.comments.map((comment) => (
                        <View key={comment.id} style={styles.comment}>
                          <View style={styles.commentAvatar}>
                            <Text style={styles.commentAvatarText}>
                              {comment.userAvatar || '👤'}
                            </Text>
                          </View>
                          <View style={styles.commentContent}>
                            <ThemedText type="defaultSemiBold" style={styles.commentUser}>
                              {comment.userName}
                            </ThemedText>
                            <ThemedText style={styles.commentText}>{comment.text}</ThemedText>
                            <ThemedText style={[styles.commentTime, { color: colors.icon }]}>
                              {formatTimeAgo(comment.timestamp)}
                            </ThemedText>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Add Comment */}
                  <View style={styles.addComment}>
                    <TextInput
                      style={[
                        styles.commentInput,
                        {
                          backgroundColor: colorScheme === 'dark' ? '#333' : '#F5F5F5',
                          color: colors.text,
                        },
                      ]}
                      placeholder="Add a comment..."
                      placeholderTextColor={colors.icon}
                      value={commentText[session.id] || ''}
                      onChangeText={(text) =>
                        setCommentText({ ...commentText, [session.id]: text })
                      }
                    />
                    <TouchableOpacity
                      style={[styles.sendButton, { backgroundColor: colors.tint }]}
                      onPress={() => {
                        // Handle comment submission
                        setCommentText({ ...commentText, [session.id]: '' });
                      }}>
                      <Text style={styles.sendIcon}>↑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  postCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4ECDC420',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  timestamp: {
    fontSize: 12,
  },
  menuIcon: {
    fontSize: 20,
    paddingHorizontal: 8,
  },
  sessionInfo: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 16,
  },
  locationText: {
    fontSize: 15,
  },
  postNotes: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: 12,
  },
  commentsDivider: {
    height: 1,
    backgroundColor: '#CCCCCC30',
    marginBottom: 12,
  },
  commentsList: {
    gap: 12,
    marginBottom: 12,
  },
  comment: {
    flexDirection: 'row',
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4ECDC420',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 11,
  },
  addComment: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    fontSize: 14,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

