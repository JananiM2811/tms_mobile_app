import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {
  FiShield,
  FiUsers,
  FiTool,
  FiUserCheck,
  FiMessageSquare,
  FiBell,
  FiLayers,
  FiActivity,
  FiBookOpen,
  FiLock,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiSend,
  FiCheck,
  FiZap,
} from '../components/Icons';
import { TMSLogoIcon } from '../components/TMSLogo';

export const LandingScreen = ({ onGoToLogin }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* TOP NAVBAR */}
      <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
        <View style={styles.brandRow}>
          <TMSLogoIcon size={isMobile ? 32 : 38} />
          <View>
            <Text style={[styles.brandName, isMobile && { fontSize: 18 }]}>TMS</Text>
            {!isMobile && (
              <Text style={styles.brandTag}>Ticket Management System</Text>
            )}
          </View>
        </View>

        <View style={styles.navRight}>
          <TouchableOpacity
            style={[styles.navLoginBtn, isMobile && styles.navLoginBtnMobile]}
            onPress={onGoToLogin}
            activeOpacity={0.85}
          >
            <Text style={[styles.navLoginText, isMobile && { fontSize: 12 }]}>Sign In</Text>
            <FiArrowRight size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* HERO SECTION */}
      <View style={[styles.heroWrapper, isMobile && styles.heroWrapperMobile]}>
        <View style={styles.heroSection}>
          <View style={styles.heroPill}>
            <View style={styles.pulsingDot} />
            <Text style={[styles.heroPillText, isMobile && { fontSize: 11 }]}>
              {isMobile ? 'Live Team Messages & Alerts' : 'Live Real-Time Team Messages & Top-Bar Notifications'}
            </Text>
          </View>

          <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
            Unified Complaint Resolution &{' '}
            <Text style={styles.heroHighlight}>Real-Time Team Messaging</Text>
          </Text>

          <Text style={[styles.heroDesc, isMobile && styles.heroDescMobile]}>
            Streamline organization complaints across IT, Facilities, and Operations. Collaborate
            with instant 1-on-1 team chats, department channels, and real-time top-bar notifications—powered
            by strict 4-tier RBAC security.
          </Text>

          <View style={[styles.heroCtaRow, isMobile && styles.heroCtaRowMobile]}>
            <TouchableOpacity
              style={[styles.heroCtaPrimary, isMobile && styles.ctaBtnMobile]}
              onPress={onGoToLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.heroCtaPrimaryText}>Launch Complaint Portal</Text>
              <FiArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.heroCtaSecondary, isMobile && styles.ctaBtnMobile]}
              onPress={onGoToLogin}
              activeOpacity={0.85}
            >
              <FiZap size={15} color="#0F172A" />
              <Text style={styles.heroCtaSecondaryText}>Explore Demo Logins</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO INTERACTIVE WORKSPACE PREVIEW MOCKUP */}
        <View style={[styles.mockupContainer, isMobile && styles.mockupContainerMobile]}>
          <View style={styles.mockupBrowserBar}>
            <View style={styles.browserDots}>
              <View style={[styles.bDot, { backgroundColor: '#EF4444' }]} />
              <View style={[styles.bDot, { backgroundColor: '#F59E0B' }]} />
              <View style={[styles.bDot, { backgroundColor: '#10B981' }]} />
            </View>
            {!isMobile && (
              <View style={styles.browserAddressBar}>
                <FiLock size={11} color="#64748B" />
                <Text style={styles.browserAddressText}>tms.internal/workspace/tickets</Text>
              </View>
            )}
            <View style={styles.browserStatusPill}>
              <View style={styles.onlineDotMini} />
              <Text style={styles.browserStatusText}>Live 200 OK</Text>
            </View>
          </View>

          <View style={[styles.mockupBody, isMobile && styles.mockupBodyMobile]}>
            {/* Mock Left: Live Ticket Status */}
            <View style={[styles.mockTicketCard, isMobile && styles.mockCardMobile]}>
              <View style={styles.mockHeaderRow}>
                <View style={styles.ticketBadgeRow}>
                  <Text style={styles.ticketIdTag}>TK-1048</Text>
                  <View style={styles.highPriorityPill}>
                    <Text style={styles.highPriorityText}>HIGH</Text>
                  </View>
                </View>
                <View style={styles.inProgressBadge}>
                  <Text style={styles.inProgressText}>● IN PROGRESS</Text>
                </View>
              </View>

              <Text style={styles.mockTicketTitle}>Core Database Latency & API Timeout</Text>
              <Text style={styles.mockTicketSub}>IT & Software • SLA Remaining: 42m</Text>

              <View style={styles.mockTicketAssignee}>
                <View style={styles.techAvatar}>
                  <Text style={styles.techAvatarText}>AR</Text>
                </View>
                <View>
                  <Text style={styles.techName}>Alex Rivera</Text>
                  <Text style={styles.techRole}>Lead Diagnostics Technician</Text>
                </View>
              </View>
            </View>

            {/* Mock Right: Live Team Chat & Notification */}
            <View style={[styles.mockChatCard, isMobile && styles.mockCardMobile]}>
              {/* Top Notification Toast */}
              <View style={styles.mockNotifToast}>
                <FiBell size={14} color="#2563EB" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifToastTitle}>New Message from System Admin</Text>
                  <Text style={styles.notifToastBody} numberOfLines={1}>
                    "Server patch has been deployed to production..."
                  </Text>
                </View>
                <View style={styles.notifToastBadge}>
                  <Text style={styles.notifToastBadgeText}>1 New</Text>
                </View>
              </View>

              {/* Chat snippet */}
              <View style={styles.mockChatStream}>
                <View style={styles.mockBubbleThem}>
                  <Text style={styles.mockBubbleSender}>System Admin • ADMIN</Text>
                  <Text style={styles.mockBubbleText}>
                    Hey Harini! The database indexing patch is active. Can you confirm from your end?
                  </Text>
                  <Text style={styles.mockBubbleTime}>2:44 PM</Text>
                </View>

                <View style={styles.mockBubbleMe}>
                  <Text style={styles.mockBubbleTextMe}>
                    Checking now! Queries are responding in 18ms. Everything looks stable! 👍
                  </Text>
                  <View style={styles.meFooterRow}>
                    <Text style={styles.mockBubbleTimeMe}>2:46 PM</Text>
                    <FiCheck size={11} color="#2563EB" />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* STATS & METRICS RIBBON */}
      <View style={[styles.statsRibbon, isMobile && styles.statsRibbonMobile]}>
        <View style={[styles.statsContainer, isMobile && styles.statsContainerMobile]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Strictly Scoped RBAC Roles</Text>
          </View>
          {!isMobile && <View style={styles.statDivider} />}
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>&lt; 15 min</Text>
            <Text style={styles.statLabel}>Average SLA Response Time</Text>
          </View>
          {!isMobile && <View style={styles.statDivider} />}
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Real-Time Team Chat & Alerts</Text>
          </View>
          {!isMobile && <View style={styles.statDivider} />}
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>Zero Loss</Text>
            <Text style={styles.statLabel}>Permanent MongoDB Storage</Text>
          </View>
        </View>
      </View>

      {/* 4 SCOPED ROLES HIERARCHY */}
      <View style={[styles.rolesSection, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionBadge}>ENTERPRISE RBAC ARCHITECTURE</Text>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
          One Portal • 4 Distinct Operational Workflows
        </Text>
        <Text style={styles.sectionSubtitle}>
          Your login credentials automatically route you to your designated dashboard with strict
          data isolation:
        </Text>

        <View style={styles.rolesGrid}>
          {/* Admin */}
          <View style={[styles.roleCard, styles.roleAdmin, isMobile && styles.cardFullWidth]}>
            <View style={styles.roleCardTop}>
              <View style={[styles.roleIconBox, { backgroundColor: '#FEF3C7' }]}>
                <FiShield size={20} color="#D97706" />
              </View>
              <View style={[styles.badgePill, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.badgeText, { color: '#92400E' }]}>ALL DEPTS</Text>
              </View>
            </View>
            <Text style={styles.roleTitle}>Administrator</Text>
            <Text style={styles.roleScope}>Full Organizational Authority</Text>
            <Text style={styles.roleDesc}>
              Complete control across IT, Maintenance, and HR. Create departments, manage users,
              inspect audit logs, and oversee global ticket resolution.
            </Text>
          </View>

          {/* Team Lead */}
          <View style={[styles.roleCard, styles.roleLead, isMobile && styles.cardFullWidth]}>
            <View style={styles.roleCardTop}>
              <View style={[styles.roleIconBox, { backgroundColor: '#EDE9FE' }]}>
                <FiUsers size={20} color="#7C3AED" />
              </View>
              <View style={[styles.badgePill, { backgroundColor: '#EDE9FE' }]}>
                <Text style={[styles.badgeText, { color: '#5B21B6' }]}>DEPT SUPERVISOR</Text>
              </View>
            </View>
            <Text style={styles.roleTitle}>Team Lead</Text>
            <Text style={styles.roleScope}>Department Supervision</Text>
            <Text style={styles.roleDesc}>
              Sees only tickets routed to their department. Assigns issues to technicians, monitors
              SLA deadlines, and ensures swift issue resolution.
            </Text>
          </View>

          {/* Technician */}
          <View style={[styles.roleCard, styles.roleTech, isMobile && styles.cardFullWidth]}>
            <View style={styles.roleCardTop}>
              <View style={[styles.roleIconBox, { backgroundColor: '#E0F2FE' }]}>
                <FiTool size={20} color="#0284C7" />
              </View>
              <View style={[styles.badgePill, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.badgeText, { color: '#0369A1' }]}>ASSIGNED QUEUE</Text>
              </View>
            </View>
            <Text style={styles.roleTitle}>Technician</Text>
            <Text style={styles.roleScope}>Assigned Tickets Only</Text>
            <Text style={styles.roleDesc}>
              Laser-focused queue of assigned tickets. Updates resolution status (In Progress,
              Resolved), provides diagnostic notes, and chats with reporters.
            </Text>
          </View>

          {/* Employee */}
          <View style={[styles.roleCard, styles.roleEmployee, isMobile && styles.cardFullWidth]}>
            <View style={styles.roleCardTop}>
              <View style={[styles.roleIconBox, { backgroundColor: '#D1FAE5' }]}>
                <FiUserCheck size={20} color="#059669" />
              </View>
              <View style={[styles.badgePill, { backgroundColor: '#D1FAE5' }]}>
                <Text style={[styles.badgeText, { color: '#065F46' }]}>SELF SERVICE</Text>
              </View>
            </View>
            <Text style={styles.roleTitle}>Employee</Text>
            <Text style={styles.roleScope}>Self-Raised Issues & Chat</Text>
            <Text style={styles.roleDesc}>
              Raise complaints in seconds, track real-time resolution progress, receive top-bar alerts,
              and communicate directly with support staff.
            </Text>
          </View>
        </View>
      </View>

      {/* 6 HIGH-IMPACT FEATURE SPOTLIGHT */}
      <View style={[styles.featuresSection, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionBadge}>ENTERPRISE CAPABILITIES</Text>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
          Engineered for High-Velocity Teams
        </Text>
        <Text style={styles.sectionSubtitle}>
          Everything your organization needs to handle support requests and team communication:
        </Text>

        <View style={styles.featureGrid}>
          {/* Feature 1 */}
          <View style={[styles.featureBox, isMobile && styles.cardFullWidth]}>
            <View style={[styles.featIconBox, { backgroundColor: '#EFF6FF' }]}>
              <FiMessageSquare size={20} color="#2563EB" />
            </View>
            <Text style={styles.featTitle}>Real-Time Team Messages & Channels</Text>
            <Text style={styles.featDesc}>
              Direct 1-on-1 messaging between team members, plus organization-wide channels (IT Support,
              Facilities, General) with live unread indicators.
            </Text>
          </View>

          {/* Feature 2 */}
          <View style={[styles.featureBox, isMobile && styles.cardFullWidth]}>
            <View style={[styles.featIconBox, { backgroundColor: '#FEF3C7' }]}>
              <FiBell size={20} color="#D97706" />
            </View>
            <Text style={styles.featTitle}>Smart Top-Bar Notification Center</Text>
            <Text style={styles.featDesc}>
              Real-time bell alerts for incoming messages and ticket updates. Includes preview snippets
              and one-click jumps straight into the conversation.
            </Text>
          </View>

          {/* Feature 3 */}
          <View style={[styles.featureBox, isMobile && styles.cardFullWidth]}>
            <View style={[styles.featIconBox, { backgroundColor: '#EDE9FE' }]}>
              <FiLayers size={20} color="#7C3AED" />
            </View>
            <Text style={styles.featTitle}>Dynamic Department Routing</Text>
            <Text style={styles.featDesc}>
              Automatically routes tickets to IT, Facilities, or HR teams. Admins can create and customize
              new departments anytime without downtime.
            </Text>
          </View>

          {/* Feature 4 */}
          <View style={[styles.featureBox, isMobile && styles.cardFullWidth]}>
            <View style={[styles.featIconBox, { backgroundColor: '#ECFDF5' }]}>
              <FiLock size={20} color="#059669" />
            </View>
            <Text style={styles.featTitle}>Zero-Leak Data Isolation</Text>
            <Text style={styles.featDesc}>
              Strict JWT tokens and database-level filters guarantee technicians and leads only see
              data belonging to their scope.
            </Text>
          </View>

          {/* Feature 5 */}
          <View style={[styles.featureBox, isMobile && styles.cardFullWidth]}>
            <View style={[styles.featIconBox, { backgroundColor: '#FEE2E2' }]}>
              <FiActivity size={20} color="#DC2626" />
            </View>
            <Text style={styles.featTitle}>Live Analytics & SLA Tracking</Text>
            <Text style={styles.featDesc}>
              Comprehensive performance dashboards tracking average resolution times, SLA compliance,
              ticket volume by category, and CSAT ratings.
            </Text>
          </View>

          {/* Feature 6 */}
          <View style={[styles.featureBox, isMobile && styles.cardFullWidth]}>
            <View style={[styles.featIconBox, { backgroundColor: '#F0FDF4' }]}>
              <FiBookOpen size={20} color="#16A34A" />
            </View>
            <Text style={styles.featTitle}>Self-Service Knowledge Base</Text>
            <Text style={styles.featDesc}>
              Pre-loaded troubleshooting guides, FAQs, and office protocols that allow employees to
              resolve common issues without waiting on support.
            </Text>
          </View>
        </View>
      </View>

      {/* QUICK DEMO CREDENTIALS SECTION */}
      <View style={[styles.demoSection, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionBadge}>TEST-DRIVE INSTANTLY</Text>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
          Ready-to-Use Demo Accounts
        </Text>
        <Text style={styles.sectionSubtitle}>
          Choose any role to experience the portal from their exact perspective:
        </Text>

        <View style={styles.demoGrid}>
          <TouchableOpacity
            style={[styles.demoCard, isMobile && styles.cardFullWidth]}
            onPress={onGoToLogin}
            activeOpacity={0.85}
          >
            <View style={styles.demoHeader}>
              <Text style={styles.demoRoleName}>Administrator</Text>
              <View style={[styles.badgePill, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.badgeText, { color: '#92400E' }]}>Full Org</Text>
              </View>
            </View>
            <Text style={styles.demoCredLabel}>Email:</Text>
            <Text style={styles.demoCredVal}>admin@gmail.com</Text>
            <Text style={styles.demoCredLabel}>Password:</Text>
            <Text style={styles.demoCredVal}>admin123</Text>
            <View style={styles.demoActionBtn}>
              <Text style={styles.demoActionText}>Login as Admin →</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoCard, isMobile && styles.cardFullWidth]}
            onPress={onGoToLogin}
            activeOpacity={0.85}
          >
            <View style={styles.demoHeader}>
              <Text style={styles.demoRoleName}>Employee (Harini)</Text>
              <View style={[styles.badgePill, { backgroundColor: '#D1FAE5' }]}>
                <Text style={[styles.badgeText, { color: '#065F46' }]}>Chat & Tickets</Text>
              </View>
            </View>
            <Text style={styles.demoCredLabel}>Email:</Text>
            <Text style={styles.demoCredVal}>harini@gmail.com</Text>
            <Text style={styles.demoCredLabel}>Password:</Text>
            <Text style={styles.demoCredVal}>password123</Text>
            <View style={styles.demoActionBtn}>
              <Text style={styles.demoActionText}>Login as Harini →</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoCard, isMobile && styles.cardFullWidth]}
            onPress={onGoToLogin}
            activeOpacity={0.85}
          >
            <View style={styles.demoHeader}>
              <Text style={styles.demoRoleName}>Technician</Text>
              <View style={[styles.badgePill, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.badgeText, { color: '#0369A1' }]}>Assigned</Text>
              </View>
            </View>
            <Text style={styles.demoCredLabel}>Email:</Text>
            <Text style={styles.demoCredVal}>tech@gmail.com</Text>
            <Text style={styles.demoCredLabel}>Password:</Text>
            <Text style={styles.demoCredVal}>tech123</Text>
            <View style={styles.demoActionBtn}>
              <Text style={styles.demoActionText}>Login as Tech →</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.demoCard, isMobile && styles.cardFullWidth]}
            onPress={onGoToLogin}
            activeOpacity={0.85}
          >
            <View style={styles.demoHeader}>
              <Text style={styles.demoRoleName}>Team Lead</Text>
              <View style={[styles.badgePill, { backgroundColor: '#EDE9FE' }]}>
                <Text style={[styles.badgeText, { color: '#5B21B6' }]}>Supervisor</Text>
              </View>
            </View>
            <Text style={styles.demoCredLabel}>Email:</Text>
            <Text style={styles.demoCredVal}>lead@gmail.com</Text>
            <Text style={styles.demoCredLabel}>Password:</Text>
            <Text style={styles.demoCredVal}>lead123</Text>
            <View style={styles.demoActionBtn}>
              <Text style={styles.demoActionText}>Login as Lead →</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOTTOM CTA BANNER */}
      <View style={[styles.bottomBanner, isMobile && styles.bottomBannerMobile]}>
        <View style={[styles.bannerInner, isMobile && styles.bannerInnerMobile]}>
          <Text style={[styles.bannerTitle, isMobile && styles.bannerTitleMobile]}>
            Ready to transform your organization's support & communication?
          </Text>
          <Text style={styles.bannerSub}>
            Join thousands of productive teams resolving complaints faster with real-time transparency.
          </Text>
          <TouchableOpacity style={styles.bannerBtn} onPress={onGoToLogin} activeOpacity={0.85}>
            <Text style={styles.bannerBtnText}>Enter Portal Now</Text>
            <FiArrowRight size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* FOOTER */}
      <View style={[styles.footer, isMobile && styles.footerMobile]}>
        <View style={[styles.footerRow, isMobile && styles.footerRowMobile]}>
          <View style={styles.footerBrand}>
            <TMSLogoIcon size={26} />
            <Text style={styles.footerBrandName}>TMS Enterprise</Text>
          </View>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} TMS (Ticket Management System). All rights reserved.
          </Text>
          <View style={styles.footerStatus}>
            <View style={styles.onlineDotMini} />
            <Text style={styles.footerStatusText}>MongoDB Persistent Engine Operational</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 18,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  navbarMobile: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  brandLogoBoxMobile: {
    width: 34,
    height: 34,
    borderRadius: 8,
  },
  brandLogo: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  versionBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  versionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60A5FA',
  },
  brandTag: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLoginBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  navLoginBtnMobile: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  navLoginText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroWrapper: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingTop: 64,
    paddingBottom: 72,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroWrapperMobile: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  heroSection: {
    alignItems: 'center',
    maxWidth: 860,
    alignSelf: 'center',
    width: '100%',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 24,
    marginBottom: 20,
    maxWidth: '100%',
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
  },
  heroPillText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: 20,
    letterSpacing: -1,
  },
  heroTitleMobile: {
    fontSize: 26,
    lineHeight: 34,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  heroHighlight: {
    color: '#38BDF8',
  },
  heroDesc: {
    fontSize: 17,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 36,
    maxWidth: 720,
  },
  heroDescMobile: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  heroCtaRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroCtaRowMobile: {
    flexDirection: 'column',
    width: '100%',
    gap: 12,
  },
  ctaBtnMobile: {
    width: '100%',
    justifyContent: 'center',
  },
  heroCtaPrimary: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  heroCtaPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  heroCtaSecondary: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroCtaSecondaryText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  mockupContainer: {
    width: '100%',
    maxWidth: 980,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 52,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  mockupContainerMobile: {
    marginTop: 32,
    borderRadius: 12,
  },
  mockupBrowserBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  browserDots: {
    flexDirection: 'row',
    gap: 6,
  },
  bDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  browserAddressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  browserAddressText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  browserStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  onlineDotMini: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  browserStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
  },
  mockupBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
    backgroundColor: '#0B0F19',
  },
  mockupBodyMobile: {
    flexDirection: 'column',
    padding: 12,
    gap: 12,
  },
  mockTicketCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mockChatCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mockCardMobile: {
    minWidth: '100%',
    padding: 14,
  },
  mockHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketIdTag: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  highPriorityPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  highPriorityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F87171',
  },
  inProgressBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FBBF24',
  },
  mockTicketTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  mockTicketSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
  },
  mockTicketAssignee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  techAvatar: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  techAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  techName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  techRole: {
    fontSize: 11,
    color: '#94A3B8',
  },
  mockNotifToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.35)',
    marginBottom: 12,
  },
  notifToastTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  notifToastBody: {
    fontSize: 11,
    color: '#94A3B8',
  },
  notifToastBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  notifToastBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mockChatStream: {
    gap: 10,
  },
  mockBubbleThem: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mockBubbleSender: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 4,
  },
  mockBubbleText: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  mockBubbleTime: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'right',
  },
  mockBubbleMe: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 10,
    borderTopRightRadius: 2,
    alignSelf: 'flex-end',
    maxWidth: '90%',
  },
  mockBubbleTextMe: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  meFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  mockBubbleTimeMe: {
    fontSize: 10,
    color: '#BFDBFE',
  },
  statsRibbon: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  statsRibbonMobile: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
    gap: 20,
  },
  statsContainerMobile: {
    flexDirection: 'column',
    gap: 18,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#334155',
  },
  rolesSection: {
    paddingHorizontal: 24,
    paddingVertical: 72,
    alignItems: 'center',
    backgroundColor: '#0B0F19',
  },
  sectionMobile: {
    paddingHorizontal: 16,
    paddingVertical: 44,
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  sectionTitleMobile: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 36,
    maxWidth: 640,
    lineHeight: 22,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    maxWidth: 1160,
    width: '100%',
    justifyContent: 'center',
  },
  roleCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 22,
    flex: 1,
    minWidth: 260,
    maxWidth: 275,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardFullWidth: {
    minWidth: '100%',
    maxWidth: '100%',
  },
  roleAdmin: {
    borderTopWidth: 4,
    borderTopColor: '#F59E0B',
  },
  roleLead: {
    borderTopWidth: 4,
    borderTopColor: '#8B5CF6',
  },
  roleTech: {
    borderTopWidth: 4,
    borderTopColor: '#0284C7',
  },
  roleEmployee: {
    borderTopWidth: 4,
    borderTopColor: '#10B981',
  },
  roleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  roleIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  roleScope: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 10,
  },
  roleDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingVertical: 72,
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    maxWidth: 1160,
    width: '100%',
    marginTop: 12,
    justifyContent: 'center',
  },
  featureBox: {
    flex: 1,
    minWidth: 320,
    maxWidth: 360,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 22,
    borderWidth: 1,
    borderColor: '#334155',
  },
  featIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  featTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  featDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
  },
  demoSection: {
    paddingHorizontal: 24,
    paddingVertical: 72,
    alignItems: 'center',
    backgroundColor: '#0B0F19',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    maxWidth: 1160,
    width: '100%',
    justifyContent: 'center',
  },
  demoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 18,
    flex: 1,
    minWidth: 250,
    maxWidth: 275,
    borderWidth: 1,
    borderColor: '#334155',
  },
  demoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoRoleName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  demoCredLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
  },
  demoCredVal: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '700',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#334155',
  },
  demoActionBtn: {
    marginTop: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  demoActionText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBanner: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingVertical: 48,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    alignItems: 'center',
  },
  bottomBannerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  bannerInner: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    maxWidth: 960,
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  bannerInnerMobile: {
    padding: 22,
    borderRadius: 14,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    maxWidth: 720,
    lineHeight: 34,
  },
  bannerTitleMobile: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 8,
  },
  bannerSub: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 580,
    lineHeight: 22,
  },
  bannerBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  bannerBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  footer: {
    paddingVertical: 26,
    paddingHorizontal: 36,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0B0F19',
  },
  footerMobile: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1160,
    alignSelf: 'center',
    width: '100%',
    gap: 16,
  },
  footerRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoBoxSmall: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoSmall: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  footerBrandName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
  },
  footerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerStatusText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
