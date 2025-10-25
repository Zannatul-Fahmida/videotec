import React from 'react';

interface Comment {
  id: number;
  avatar?: string; // Optional avatar
  text: string;
  hasAvatar: boolean;
}

const Comments: React.FC = () => {
  // Sample comments data matching the image structure
  const comments: Comment[] = [
    {
      id: 1,
      avatar: '/src/assets/student.png',
      text: 'Super Court C\'etait Trop Bien',
      hasAvatar: true
    },
    {
      id: 2,
      avatar: '/src/assets/profile.png',
      text: 'Je N\'ai Pas Compris Le Head Lock',
      hasAvatar: true
    },
    {
      id: 3,
      avatar: '/src/assets/student.png',
      text: 'Message',
      hasAvatar: true
    },
    {
      id: 4,
      text: 'Commentaires',
      hasAvatar: false
    }
  ];

  return (
    <div>
      {/* Comments Header */}
      <h2 className="text-[#C0BFC4] text-lg font-medium mb-6">COMMENTAIRES</h2>
      
      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-center space-x-3">
            {/* Profile Avatar or Empty Space */}
            <div className="flex-shrink-0 w-12 h-12">
              {comment.hasAvatar ? (
                <img 
                  src={comment.avatar} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12" /> // Empty space to maintain layout
              )}
            </div>
            
            {/* Comment Text */}
            <div className="flex-1">
              <div className="bg-[#3D4651] rounded-lg px-4 py-3">
                <p className="text-[#C0BFC4] text-sm">{comment.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;