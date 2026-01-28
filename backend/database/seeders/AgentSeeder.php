<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AgentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the vendor user
        $vendor = User::where('email', 'vendor@greatamerican.ai')->first();

        if (!$vendor) {
            $this->command->error('Vendor user not found. Please run DatabaseSeeder first.');
            return;
        }

        $agents = [
            [
                'name' => 'CustomerCare Pro AI',
                'description' => 'Advanced AI customer service agent that handles inquiries 24/7 with natural language processing',
                'long_description' => 'CustomerCare Pro AI is a sophisticated customer service solution powered by GPT-4. It provides instant responses to customer inquiries, handles multiple languages, and integrates seamlessly with your existing CRM systems. Features include sentiment analysis, ticket routing, and comprehensive analytics dashboard.',
                'price' => 299.99,
                'category' => 'Customer Service',
                'model' => 'GPT-4 Turbo',
                'response_time' => '< 1 second',
                'capabilities' => [
                    '24/7 Customer Support',
                    'Multi-language Support',
                    'Sentiment Analysis',
                    'Ticket Routing',
                    'CRM Integration',
                    'Analytics Dashboard'
                ],
                'languages' => ['English', 'Spanish', 'French', 'German', 'Italian'],
                'tags' => ['customer-service', 'chatbot', 'automation', 'support'],
                'image' => 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop'
                ],
                'status' => 'active',
                'rating' => 4.8,
                'reviews' => 127,
                'sales' => 45,
                'date_added' => Carbon::now()->subDays(30),
            ],
            [
                'name' => 'ContentGenius AI',
                'description' => 'AI-powered content creation tool that generates high-quality articles, blogs, and marketing copy',
                'long_description' => 'ContentGenius AI revolutionizes content creation with advanced natural language generation. Create engaging blog posts, social media content, product descriptions, and marketing materials in minutes. Features include SEO optimization, tone adjustment, plagiarism checking, and multi-format export capabilities.',
                'price' => 199.99,
                'category' => 'Content Creation',
                'model' => 'GPT-4 + Claude',
                'response_time' => '< 3 seconds',
                'capabilities' => [
                    'Blog Post Generation',
                    'SEO Optimization',
                    'Tone Adjustment',
                    'Plagiarism Check',
                    'Multi-format Export',
                    'Content Templates'
                ],
                'languages' => ['English', 'Spanish', 'French', 'Portuguese'],
                'tags' => ['content-creation', 'writing', 'seo', 'marketing'],
                'image' => 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop'
                ],
                'status' => 'active',
                'rating' => 4.6,
                'reviews' => 89,
                'sales' => 32,
                'date_added' => Carbon::now()->subDays(25),
            ],
            [
                'name' => 'DataAnalyzer Pro',
                'description' => 'Intelligent data analysis tool that processes large datasets and generates actionable insights',
                'long_description' => 'DataAnalyzer Pro uses advanced machine learning algorithms to analyze complex datasets and provide meaningful insights. Features include automated report generation, predictive analytics, data visualization, and integration with popular data sources like Excel, CSV, and databases.',
                'price' => 449.99,
                'category' => 'Data Analysis',
                'model' => 'GPT-4 + Custom ML',
                'response_time' => '< 5 seconds',
                'capabilities' => [
                    'Automated Analysis',
                    'Predictive Analytics',
                    'Data Visualization',
                    'Report Generation',
                    'Multi-source Integration',
                    'Real-time Processing'
                ],
                'languages' => ['English'],
                'tags' => ['data-analysis', 'analytics', 'business-intelligence', 'ml'],
                'image' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
                'video_url' => null,
                'thumbnail_image' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
                ],
                'status' => 'active',
                'rating' => 4.9,
                'reviews' => 156,
                'sales' => 78,
                'date_added' => Carbon::now()->subDays(20),
            ],
            [
                'name' => 'AutoWorkflow AI',
                'description' => 'Automation platform that streamlines business processes and eliminates manual tasks',
                'long_description' => 'AutoWorkflow AI automates repetitive business processes, saving time and reducing errors. Connect your favorite apps and create custom workflows with drag-and-drop interface. Supports integrations with 500+ apps including Slack, Gmail, Salesforce, and more.',
                'price' => 349.99,
                'category' => 'Automation',
                'model' => 'GPT-4 + RPA',
                'response_time' => '< 2 seconds',
                'capabilities' => [
                    'Workflow Automation',
                    '500+ App Integrations',
                    'Drag-and-drop Builder',
                    'Scheduled Tasks',
                    'Error Handling',
                    'Analytics & Monitoring'
                ],
                'languages' => ['English', 'Spanish', 'French'],
                'tags' => ['automation', 'workflow', 'productivity', 'integration'],
                'image' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_image' => null,
                'gallery_images' => [],
                'status' => 'pending',
                'rating' => 0,
                'reviews' => 0,
                'sales' => 0,
                'date_added' => Carbon::now()->subDays(5),
            ],
            [
                'name' => 'ResearchAssistant AI',
                'description' => 'AI-powered research tool that gathers, analyzes, and synthesizes information from multiple sources',
                'long_description' => 'ResearchAssistant AI helps researchers and professionals gather comprehensive information quickly. It searches across academic databases, news sources, and web content, then synthesizes findings into coherent reports. Features include citation management, source verification, and multi-format export.',
                'price' => 249.99,
                'category' => 'Research',
                'model' => 'GPT-4 + Search API',
                'response_time' => '< 10 seconds',
                'capabilities' => [
                    'Multi-source Research',
                    'Citation Management',
                    'Source Verification',
                    'Report Synthesis',
                    'Academic Database Access',
                    'Export Formats'
                ],
                'languages' => ['English', 'Spanish', 'French', 'German'],
                'tags' => ['research', 'academic', 'information', 'analysis'],
                'image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
                'video_url' => null,
                'thumbnail_image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
                ],
                'status' => 'active',
                'rating' => 4.7,
                'reviews' => 94,
                'sales' => 41,
                'date_added' => Carbon::now()->subDays(15),
            ],
            [
                'name' => 'SalesBoost AI',
                'description' => 'Intelligent sales assistant that helps close deals faster with personalized recommendations',
                'long_description' => 'SalesBoost AI analyzes customer interactions and provides real-time sales recommendations. It helps identify upsell opportunities, suggests personalized offers, and automates follow-up communications. Integrates with major CRM platforms and provides detailed sales analytics.',
                'price' => 399.99,
                'category' => 'Sales',
                'model' => 'GPT-4 + Sales Analytics',
                'response_time' => '< 2 seconds',
                'capabilities' => [
                    'Sales Recommendations',
                    'Upsell Identification',
                    'CRM Integration',
                    'Automated Follow-ups',
                    'Sales Analytics',
                    'Lead Scoring'
                ],
                'languages' => ['English', 'Spanish'],
                'tags' => ['sales', 'crm', 'revenue', 'automation'],
                'image' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop'
                ],
                'status' => 'active',
                'rating' => 4.5,
                'reviews' => 112,
                'sales' => 67,
                'date_added' => Carbon::now()->subDays(12),
            ],
            [
                'name' => 'MarketingMaster AI',
                'description' => 'Complete marketing automation platform with AI-powered campaign optimization',
                'long_description' => 'MarketingMaster AI creates, manages, and optimizes marketing campaigns across multiple channels. Features include audience segmentation, A/B testing, performance analytics, and automated content personalization. Supports email, social media, and paid advertising campaigns.',
                'price' => 499.99,
                'category' => 'Marketing',
                'model' => 'GPT-4 + Marketing Analytics',
                'response_time' => '< 3 seconds',
                'capabilities' => [
                    'Campaign Management',
                    'Audience Segmentation',
                    'A/B Testing',
                    'Multi-channel Support',
                    'Performance Analytics',
                    'Content Personalization'
                ],
                'languages' => ['English', 'Spanish', 'French', 'German', 'Italian'],
                'tags' => ['marketing', 'campaigns', 'automation', 'analytics'],
                'image' => 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
                'video_url' => null,
                'thumbnail_image' => 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop'
                ],
                'status' => 'active',
                'rating' => 4.6,
                'reviews' => 203,
                'sales' => 124,
                'date_added' => Carbon::now()->subDays(8),
            ],
            [
                'name' => 'CodeHelper AI',
                'description' => 'AI coding assistant that helps developers write better code faster',
                'long_description' => 'CodeHelper AI is an intelligent coding assistant that provides real-time code suggestions, bug detection, and refactoring recommendations. Supports 50+ programming languages, integrates with popular IDEs, and includes features like code review, documentation generation, and test case creation.',
                'price' => 179.99,
                'category' => 'Development',
                'model' => 'GPT-4 + Codex',
                'response_time' => '< 1 second',
                'capabilities' => [
                    'Code Suggestions',
                    'Bug Detection',
                    'Refactoring',
                    '50+ Languages',
                    'IDE Integration',
                    'Documentation Generation'
                ],
                'languages' => ['English'],
                'tags' => ['development', 'coding', 'programming', 'productivity'],
                'image' => 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'thumbnail_image' => 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop'
                ],
                'status' => 'active',
                'rating' => 4.8,
                'reviews' => 278,
                'sales' => 189,
                'date_added' => Carbon::now()->subDays(3),
            ],
        ];

        foreach ($agents as $agentData) {
            Agent::updateOrCreate(
                [
                    'name' => $agentData['name'],
                    'seller_id' => $vendor->id,
                ],
                array_merge($agentData, [
                    'seller_id' => $vendor->id,
                    'api_access' => true,
                ])
            );
        }

        $this->command->info('Dummy agents created successfully for vendor account!');
        $this->command->info('Total agents created: ' . count($agents));
    }
}
