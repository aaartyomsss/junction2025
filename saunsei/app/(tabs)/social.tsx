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
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>Sauna Community 🔥</ThemedText>
          <ThemedText style={styles.subtitle}>
            See what others are enjoying
          </ThemedText>
        </View>

        {/* Social Feed */}
        {mockSocialFeed.map((session: SaunaSession) => {
          const isLiked = likedPosts.has(session.id);
          const isExpanded = expandedPosts.has(session.id);
          const displayLikes = session.likes + (isLiked ? 1 : 0);

          return (
            <View key={session.id} style={styles.postCard}>
              {/* User Header */}
              <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{session.userAvatar || '👤'}</Text>
                  </View>
                  <View>
                    <ThemedText type="defaultSemiBold" style={{ color: '#3A2F23' }}>{session.userName}</ThemedText>
                    <ThemedText style={styles.timestamp}>
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
              <View style={styles.statsBanner}>
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
                            <ThemedText style={styles.commentUser}>
                              {comment.userName}
                            </ThemedText>
                            <ThemedText style={styles.commentText}>{comment.text}</ThemedText>
                            <ThemedText style={styles.commentTime}>
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
                          color: colors.text,
                        },
                      ]}
                      placeholder="Add a comment..."
                      placeholderTextColor="#C9B59C"
                      value={commentText[session.id] || ''}
                      onChangeText={(text) =>
                        setCommentText({ ...commentText, [session.id]: text })
                      }
                    />
                    <TouchableOpacity
                      style={styles.sendButton}
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
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F8F6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    paddingTop: 64,
    backgroundColor: "transparent",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3A2F23',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#B8A58B',
    marginTop: 2,
  },
  postCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#3A2F23',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8E4DF',
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
    backgroundColor: '#C9B59C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D9CFC7',
  },
  avatarText: {
    fontSize: 24,
  },
  timestamp: {
    fontSize: 12,
    color: '#B8A58B',
  },
  menuIcon: {
    fontSize: 20,
    paddingHorizontal: 8,
    color: '#B8A58B',
  },
  sessionInfo: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  locationIcon: {
    fontSize: 16,
  },
  locationText: {
    fontSize: 15,
    color: '#3A2F23',
  },
  postNotes: {
    fontSize: 14,
    lineHeight: 20,
    color: '#3A2F23',
  },
  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#F9F8F6',
    borderWidth: 1,
    borderColor: '#E8E4DF',
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
    color: '#3A2F23',
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0EDE8',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A2F23',
  },
  commentsSection: {
    marginTop: 12,
  },
  commentsDivider: {
    height: 1,
    backgroundColor: '#E8E4DF',
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
    backgroundColor: '#C9B59C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9CFC7',
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
    color: '#3A2F23',
    fontWeight: '600',
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
    color: '#3A2F23',
  },
  commentTime: {
    fontSize: 11,
    color: '#B8A58B',
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
    backgroundColor: '#F9F8F6',
    borderWidth: 1,
    borderColor: '#E8E4DF',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C9B59C',
    shadowColor: '#C9B59C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

